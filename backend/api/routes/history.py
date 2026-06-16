from fastapi import APIRouter
from typing import List, Dict, Any
from core.db import db_client

router = APIRouter()

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_history():
    # Return all analyses from MongoDB, sorted by newest first
    cursor = db_client.analyses.find()
    items = []
    async for doc in cursor:
        doc.pop("_id", None)
        items.append(doc)
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items

@router.get("/performance")
async def get_performance():
    total_trades = 0
    wins = 0
    losses = 0
    
    cursor = db_client.analyses.find()
    async for analysis in cursor:
        if "outcome" in analysis:
            total_trades += 1
            if analysis["outcome"] == "WIN":
                wins += 1
            elif analysis["outcome"] == "LOSS":
                losses += 1
                
    win_rate = (wins / total_trades * 100) if total_trades > 0 else 0
    
    return {
        "total_tracked_trades": total_trades,
        "wins": wins,
        "losses": losses,
        "win_rate_percent": round(win_rate, 2)
    }
