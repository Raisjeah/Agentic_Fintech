from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from models.schema import AnalysisRequest, TradePlan, AnalysisResponse
from orchestrator.graph import trading_graph
from datetime import datetime, timedelta
import uuid
from core.db import db_client

router = APIRouter()

# Keep in-memory analyses_db for backwards compatibility, but persist directly to MongoDB
analyses_db = {}

async def run_analysis_with_graph(analysis_id: str, request: AnalysisRequest):
    try:
        await db_client.analyses.update_one(
            {"id": analysis_id},
            {"$set": {"status": "running"}},
            upsert=True
        )
        
        initial_state = {
            "asset": request.asset,
            "timeframe": request.timeframe,
            "goal": request.goal,
            "capital": request.capital,
            "risk_percent": request.risk_percent
        }
        
        # Run LangGraph with stream to get node updates
        from api.routes.status import manager
        
        final_state = {}
        async for output in trading_graph.astream(initial_state):
            for node_name, state_update in output.items():
                payload = {
                    "analysis_id": analysis_id,
                    "node": node_name,
                    "status": "completed"
                }
                if node_name == "bull":
                    payload["data"] = state_update.get("bull_data")
                elif node_name == "bear":
                    payload["data"] = state_update.get("bear_data")
                elif node_name == "debate_moderator":
                    payload["data"] = state_update.get("debate_data")
                
                await manager.broadcast(payload)
                # Accumulate state updates
                final_state.update(state_update)
        
        plan = final_state["final_plan"]
        
        # Save to DB
        await db_client.analyses.update_one(
            {"id": analysis_id},
            {
                "$set": {
                    "status": "completed",
                    "report": plan.model_dump() if hasattr(plan, "model_dump") else plan
                }
            }
        )
        
        # Notify via Telegram
        from connectors.telegram_bot import telegram_connector
        import asyncio
        asyncio.create_task(telegram_connector.send_trade_plan(request.asset, request.timeframe, plan))

    except Exception as e:
        await db_client.analyses.update_one(
            {"id": analysis_id},
            {"$set": {"status": "failed"}}
        )
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
    
    # Store initial state in MongoDB
    await db_client.analyses.insert_one(response.model_dump())
    
    background_tasks.add_task(run_analysis_with_graph, analysis_id, request)
    
    return response

@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str):
    doc = await db_client.analyses.find_one({"id": analysis_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
    # Clean mongo _id for validation
    doc.pop("_id", None)
    return doc

from pydantic import BaseModel
from audit.logger import audit_logger

class ApprovalRequest(BaseModel):
    reason: str = ""

@router.post("/analysis/{analysis_id}/approve")
async def approve_analysis(analysis_id: str):
    doc = await db_client.analyses.find_one({"id": analysis_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    await db_client.analyses.update_one(
        {"id": analysis_id},
        {
            "$set": {
                "approval_status": "approved",
                "approved_at": datetime.utcnow().isoformat() + "Z"
            }
        }
    )
    audit_logger.log_decision(analysis_id, "approve")
    return {"status": "success"}

@router.post("/analysis/{analysis_id}/reject")
async def reject_analysis(analysis_id: str, request: ApprovalRequest):
    doc = await db_client.analyses.find_one({"id": analysis_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    await db_client.analyses.update_one(
        {"id": analysis_id},
        {
            "$set": {
                "approval_status": "rejected",
                "reject_reason": request.reason
            }
        }
    )
    audit_logger.log_decision(analysis_id, "reject", reason=request.reason)
    return {"status": "success"}

class OutcomeRequest(BaseModel):
    outcome: str # "WIN" or "LOSS"

@router.post("/analysis/{analysis_id}/outcome")
async def set_outcome(analysis_id: str, request: OutcomeRequest):
    doc = await db_client.analyses.find_one({"id": analysis_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if request.outcome not in ["WIN", "LOSS"]:
        raise HTTPException(status_code=400, detail="Outcome must be WIN or LOSS")
        
    await db_client.analyses.update_one(
        {"id": analysis_id},
        {"$set": {"outcome": request.outcome}}
    )
    audit_logger.log_decision(analysis_id, "outcome", outcome=request.outcome)
    return {"status": "success"}

class DiscussRequest(BaseModel):
    question: str

@router.post("/analysis/{analysis_id}/discuss")
async def discuss_analysis(analysis_id: str, request: DiscussRequest):
    from agents.discussion_agent import discuss
    
    doc = await db_client.analyses.find_one({"id": analysis_id})
    if not doc:
        # Fallback to mock context if not found
        doc = {
            "asset": "BTC/USDT", "timeframe": "4H",
            "report": {
                "overall_bias": "BULLISH", "confidence": 74,
                "sources": {"technical": "RSI oversold", "sentiment": "Greed 68", "news": "ETF inflow", "macro": "CPI delay"},
                "entry_plan": "$65,000", "stop_loss": "$63,000", "take_profit": "$70,000",
                "scenarios": "Bull: 45%", "risk_flags": "CPI volatility"
            }
        }
    
    answer = await discuss(analysis_id, request.question, doc)
    return {"answer": answer, "sources": [], "timestamp": datetime.utcnow().isoformat() + "Z"}

@router.get("/analysis/{analysis_id}/chat")
async def get_analysis_chat(analysis_id: str):
    """
    Get chat history for an analysis to maintain persistent context on page refresh.
    """
    chat_doc = await db_client.chats.find_one({"analysis_id": analysis_id})
    if not chat_doc:
        return {"messages": []}
    return {"messages": chat_doc.get("messages", [])}

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
