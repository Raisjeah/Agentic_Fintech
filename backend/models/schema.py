from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class AnalysisRequest(BaseModel):
    asset: str
    timeframe: str
    goal: str
    capital: float
    risk_percent: float

class TradePlan(BaseModel):
    overall_bias: str
    confidence: int
    signal_strength: str
    trade_valid: str
    reasoning: str
    thesis: str
    counter_thesis: str
    entry_plan: Dict[str, float]
    stop_loss: float
    take_profit: List[Dict[str, Any]]
    rr_ratio: float
    money_management: Dict[str, Any]
    scenarios: Dict[str, Any]
    risk_flags: List[str]
    sources: Dict[str, Any]

class AnalysisResponse(BaseModel):
    id: str
    status: str
    valid_until: str
    created_at: str
    report: Optional[TradePlan] = None
