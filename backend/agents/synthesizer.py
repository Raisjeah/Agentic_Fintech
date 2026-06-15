import json
from typing import Dict, Any
from core.llm import get_llm_client, LLMProvider

class SynthesizerAgent:
    def __init__(self):
        # We can use Anthropic or Gemini for synthesis, falling back to Gemini for MVP
        self.llm = get_llm_client(provider=LLMProvider.GEMINI, task="smart")

    def synthesize(self, asset: str, timeframe: str, data_output: Dict[str, Any], tech_output: Dict[str, Any], news_output: Dict[str, Any] = None, sentiment_output: Dict[str, Any] = None, macro_output: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Combine outputs to generate the trade plan using LLM.
        """
        news_output = news_output or {}
        sentiment_output = sentiment_output or {}
        macro_output = macro_output or {}
        
        prompt = f"""
        You are a crypto trading synthesizer. Analyze the following data for {asset} on a {timeframe} timeframe.
        
        Market Data: {json.dumps(data_output, indent=2)}
        Technical Data: {json.dumps(tech_output, indent=2)}
        News Data: {json.dumps(news_output, indent=2)}
        Sentiment Data: {json.dumps(sentiment_output, indent=2)}
        Macro Data: {json.dumps(macro_output, indent=2)}
        
        Output a JSON object EXACTLY in this format, with no markdown code blocks or extra text:
        {{
            "overall_bias": "BULLISH|BEARISH|NEUTRAL|MIXED",
            "confidence": 0-100,
            "signal_strength": "STRONG|MODERATE|WEAK",
            "trade_valid": "YES|WAIT|NO",
            "reasoning": "A short summary reasoning combining tech, news, and macro",
            "thesis": "Full trade thesis here",
            "counter_thesis": "Counter arguments here",
            "entry_plan": {{"zone_low": float, "zone_high": float}},
            "stop_loss": float,
            "risk_flags": ["flag1", "flag2"]
        }}
        """
        
        try:
            response_text = self.llm.generate(prompt)
            if response_text.startswith("```json"):
                response_text = response_text[7:-3]
            elif response_text.startswith("```"):
                response_text = response_text[3:-3]
                
            return json.loads(response_text.strip())
        except Exception as e:
            current_price = data_output.get("current_price", 0.0)
            return {
                "overall_bias": tech_output.get("signal", "NEUTRAL"),
                "confidence": 50,
                "signal_strength": tech_output.get("strength", "MODERATE"),
                "trade_valid": "WAIT",
                "reasoning": f"LLM parsing failed or no API key. Fallback to tech signals. Error: {str(e)}",
                "thesis": "Fallback thesis based purely on technicals.",
                "counter_thesis": "Market is unpredictable.",
                "entry_plan": {"zone_low": current_price * 0.99, "zone_high": current_price * 1.01},
                "stop_loss": current_price * 0.95 if tech_output.get("signal") == "BUY" else current_price * 1.05,
                "risk_flags": ["LLM processing failed"]
            }

synthesizer_agent = SynthesizerAgent()
