from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from models.schema import AnalysisRequest, TradePlan, AnalysisResponse
from orchestrator.graph import trading_graph
from datetime import datetime, timedelta
import uuid

router = APIRouter()

analyses_db = {}

async def run_analysis_with_graph(analysis_id: str, request: AnalysisRequest):
    try:
        analyses_db[analysis_id]["status"] = "running"
        
        initial_state = {
            "asset": request.asset,
            "timeframe": request.timeframe,
            "goal": request.goal,
            "capital": request.capital,
            "risk_percent": request.risk_percent
        }
        
        # Run LangGraph with stream to get node updates
        from api.routes.status import manager
        
        async for output in trading_graph.astream(initial_state):
            for node_name, state_update in output.items():
                await manager.broadcast({
                    "analysis_id": analysis_id,
                    "node": node_name,
                    "status": "completed"
                })
                # Update final_state tracker
                final_state = state_update
        
        
        plan = final_state["final_plan"]
        
        analyses_db[analysis_id]["status"] = "completed"
        analyses_db[analysis_id]["report"] = plan
        
        # Notify via Telegram
        from connectors.telegram_bot import telegram_connector
        import asyncio
        asyncio.create_task(telegram_connector.send_trade_plan(request.asset, request.timeframe, plan))

    except Exception as e:
        analyses_db[analysis_id]["status"] = "failed"
        print(f"Analysis failed: {e}")

@router.post("/analyze", response_model=AnalysisResponse)
async def trigger_analysis(request: AnalysisRequest, background_tasks: BackgroundTasks):
    analysis_id = str(uuid.uuid4())
    now = datetime.utcnow()
    valid_until = now + timedelta(minutes=15)
    
    response = AnalysisResponse(
        id=analysis_id,
        status="pending",
        valid_until=valid_until.isoformat() + "Z",
        created_at=now.isoformat() + "Z"
    )
    
    analyses_db[analysis_id] = response.model_dump()
    
    background_tasks.add_task(run_analysis_with_graph, analysis_id, request)
    
    return response

@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str):
    if analysis_id not in analyses_db:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analyses_db[analysis_id]

from pydantic import BaseModel
from audit.logger import audit_logger

class ApprovalRequest(BaseModel):
    reason: str = ""

@router.post("/analysis/{analysis_id}/approve")
async def approve_analysis(analysis_id: str):
    if analysis_id not in analyses_db:
        raise HTTPException(status_code=404, detail="Analysis not found")
    analyses_db[analysis_id]["approval_status"] = "approved"
    analyses_db[analysis_id]["approved_at"] = datetime.utcnow().isoformat() + "Z"
    audit_logger.log_decision(analysis_id, "approve")
    return {"status": "success"}

@router.post("/analysis/{analysis_id}/reject")
async def reject_analysis(analysis_id: str, request: ApprovalRequest):
    if analysis_id not in analyses_db:
        raise HTTPException(status_code=404, detail="Analysis not found")
    analyses_db[analysis_id]["approval_status"] = "rejected"
    analyses_db[analysis_id]["reject_reason"] = request.reason
    audit_logger.log_decision(analysis_id, "reject", reason=request.reason)
    return {"status": "success"}

class OutcomeRequest(BaseModel):
    outcome: str # "WIN" or "LOSS"

@router.post("/analysis/{analysis_id}/outcome")
async def set_outcome(analysis_id: str, request: OutcomeRequest):
    if analysis_id not in analyses_db:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if request.outcome not in ["WIN", "LOSS"]:
        raise HTTPException(status_code=400, detail="Outcome must be WIN or LOSS")
    analyses_db[analysis_id]["outcome"] = request.outcome
    audit_logger.log_decision(analysis_id, "outcome", outcome=request.outcome)
    return {"status": "success"}

class DiscussRequest(BaseModel):
    question: str

@router.post("/analysis/{analysis_id}/discuss")
async def discuss_analysis(analysis_id: str, request: DiscussRequest):
    from agents.discussion_agent import discuss
    
    analysis = analyses_db.get(analysis_id, {
        "asset": "BTC/USDT", "timeframe": "4H",
        "report": {
            "overall_bias": "BULLISH", "confidence": 74,
            "sources": {"technical": "RSI oversold", "sentiment": "Greed 68", "news": "ETF inflow", "macro": "CPI delay"},
            "entry_plan": "$65,000", "stop_loss": "$63,000", "take_profit": "$70,000",
            "scenarios": "Bull: 45%", "risk_flags": "CPI volatility"
        }
    })
    
    answer = await discuss(analysis_id, request.question, analysis)
    return {"answer": answer, "sources": [], "timestamp": datetime.utcnow().isoformat() + "Z"}

@router.get("/watchlist")
async def get_watchlist():
    return {"watchlist": []}

@router.post("/watchlist")
async def add_watchlist(request: Request):
    return {"status": "success"}

@router.delete("/watchlist/{asset:path}")
async def remove_watchlist(asset: str):
    return {"status": "success"}

@router.get("/alerts")
async def get_alerts():
    return {"alerts": []}

@router.post("/alerts")
async def add_alert(request: Request):
    return {"status": "success"}

@router.delete("/alerts/{alert_id}")
async def remove_alert(alert_id: str):
    return {"status": "success"}

@router.get("/performance")
async def get_performance(period: str = "30d"):
    return {
        "win_rate": 67, "total": 24, "wins": 16, "losses": 8, "avg_confidence": 71, "by_asset": []
    }
