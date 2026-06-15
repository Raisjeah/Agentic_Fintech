import os
import json
import asyncio
from typing import Dict, Any
from core.llm import get_llm_client, LLMProvider

class BullAgent:
    def __init__(self):
        self.llm = get_llm_client(provider=LLMProvider.GEMINI, task="fast")
        
    async def argue_bullish(self, asset: str, tech_output: Dict[str, Any], news_output: Dict[str, Any], sentiment_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Argue for a bullish scenario based on technical, sentiment, and news data.
        """
        prompt = f"""
        You are a Bullish Agent. Formulate the best possible bullish argument for {asset}.
        Use the following technical, news, and sentiment data to build your case:
        
        Technical Data: {json.dumps(tech_output, indent=2)}
        News Data: {json.dumps(news_output, indent=2)}
        Sentiment Data: {json.dumps(sentiment_output, indent=2)}
        
        Provide a JSON response exactly in this format:
        {{
            "argument": "Compelling bullish argument paragraph...",
            "confidence": 0-100 (integer representing confidence in bullish setup),
            "key_points": ["point 1", "point 2", "point 3"]
        }}
        Do not include markdown blocks, just raw JSON.
        """
        try:
            llm_res = await asyncio.to_thread(self.llm.generate, prompt)
            if llm_res.startswith("```json"):
                llm_res = llm_res[7:-3]
            elif llm_res.startswith("```"):
                llm_res = llm_res[3:-3]
            parsed_res = json.loads(llm_res.strip())
            return {
                "argument": parsed_res.get("argument", "Bullish argument not generated."),
                "confidence": parsed_res.get("confidence", 50),
                "key_points": parsed_res.get("key_points", [])
            }
        except Exception as e:
            print(f"BullAgent LLM parsing error: {e}")
            return {
                "argument": "Failed to generate bullish argument due to LLM error.",
                "confidence": 50,
                "key_points": []
            }

bull_agent = BullAgent()
