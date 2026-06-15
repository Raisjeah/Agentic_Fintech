import json
from typing import Dict, Any
from core.llm import get_llm_client, LLMProvider

class RiskAgent:
    def __init__(self):
        self.llm = get_llm_client(provider=LLMProvider.GEMINI, task="fast")
        
    async def evaluate_risk(self, asset: str, ohlcv: list, macro_output: Dict[str, Any], news_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate event risk, volatility, and red flags.
        """
        # Basic volatility logic (MVP): mock ATR or calculate simple % diff
        atr_mock = 0.0
        if ohlcv and len(ohlcv) > 1:
            recent_candles = ohlcv[-5:]
            diffs = [(c["high"] - c["low"])/c["open"] * 100 for c in recent_candles]
            atr_mock = sum(diffs) / len(diffs)
            
        volatility_level = "LOW"
        if atr_mock > 5:
            volatility_level = "HIGH"
        elif atr_mock > 2:
            volatility_level = "MEDIUM"

        prompt = f"""
        Evaluate trading risks for {asset}.
        
        Volatility (recent avg % swing): {atr_mock:.2f}% ({volatility_level})
        Macro Events: {json.dumps(macro_output.get("events", []), indent=2)}
        Recent News Summary: {news_output.get("summary")}
        
        Provide a JSON response exactly in this format:
        {{
            "atr": {atr_mock:.2f},
            "volatility_level": "HIGH|MEDIUM|LOW",
            "red_flags": ["flag 1", "flag 2"],
            "event_risk": true/false,
            "risk_score": 0-100 (0=safe, 100=extreme risk),
            "recommendation": "PROCEED|WAIT|AVOID"
        }}
        Do not include markdown blocks, just raw JSON.
        """
        
        try:
            import asyncio
            llm_res = await asyncio.to_thread(self.llm.generate, prompt)
            if llm_res.startswith("```json"):
                llm_res = llm_res[7:-3]
            elif llm_res.startswith("```"):
                llm_res = llm_res[3:-3]
                
            parsed_res = json.loads(llm_res.strip())
            
            return {
                "atr": parsed_res.get("atr", atr_mock),
                "volatility_level": parsed_res.get("volatility_level", volatility_level),
                "red_flags": parsed_res.get("red_flags", []),
                "event_risk": parsed_res.get("event_risk", False),
                "risk_score": parsed_res.get("risk_score", 50),
                "recommendation": parsed_res.get("recommendation", "WAIT")
            }
            
        except Exception as e:
            print(f"RiskAgent LLM parsing error: {e}")
            return {
                "atr": atr_mock,
                "volatility_level": volatility_level,
                "red_flags": ["Risk evaluation failed"],
                "event_risk": True,
                "risk_score": 80,
                "recommendation": "WAIT"
            }

risk_agent = RiskAgent()
