from fastapi import APIRouter
from api.routes.analysis import analyses_db
from typing import List, Dict, Any

router = APIRouter()

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_history():
    # Return all analyses, sorted by newest first
    items = list(analyses_db.values())
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items

@router.get("/history/performance")
async def get_performance():
    total_trades = 0
    wins = 0
    losses = 0
    
    for analysis in analyses_db.values():
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
