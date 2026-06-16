import httpx
from typing import Dict, Any
from core.llm import get_llm_client, LLMProvider
import json

class SentimentAgent:
    def __init__(self):
        self.llm = get_llm_client(provider=LLMProvider.GEMINI, task="fast")
        
    async def fetch_sentiment(self, asset: str, news_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fetch Fear & Greed index and combine with news sentiment.
        """
        fng_score = 50
        fng_label = "Neutral"
        
        try:
            # Fetch Fear & Greed index (Crypto)
            async with httpx.AsyncClient() as client:
                res = await client.get("https://api.alternative.me/fng/?limit=1")
                if res.status_code == 200:
                    data = res.json()
                    if data.get("data"):
                        fng_score = int(data["data"][0]["value"])
                        fng_label = data["data"][0]["value_classification"]
        except Exception as e:
            print(f"Fear & Greed fetch error: {e}")

        # Use LLM to evaluate final combined sentiment
        prompt = f"""
        Evaluate the overall market sentiment for {asset}.
        
        Fear & Greed Index: {fng_score} ({fng_label})
        Recent News Summary: {news_output.get("summary")}
        News Sentiments: {[h.get("sentiment_tag") for h in news_output.get("headlines", [])]}
        
        Provide a JSON response with exactly this format:
        {{
            "score": 0-100 (overall sentiment score, 0=Extreme Bearish, 100=Extreme Bullish),
            "label": "Bullish|Bearish|Neutral",
            "breakdown": "A brief explanation of why"
        }}
        Do not include markdown blocks, just raw JSON.
        """
        
        try:
            import asyncio
            llm_res = await self.llm.generate_async(prompt)
            if llm_res.startswith("```json"):
                llm_res = llm_res[7:-3]
            elif llm_res.startswith("```"):
                llm_res = llm_res[3:-3]
                
            parsed_res = json.loads(llm_res.strip())
            
            return {
                "fng_index": {"score": fng_score, "label": fng_label},
                "score": parsed_res.get("score", fng_score),
                "label": parsed_res.get("label", "Neutral"),
                "breakdown": parsed_res.get("breakdown", "Sentiment analysis complete.")
            }
            
        except Exception as e:
            print(f"SentimentAgent LLM parsing error: {e}")
            return {
                "fng_index": {"score": fng_score, "label": fng_label},
                "score": fng_score,
                "label": "Neutral",
                "breakdown": "Failed to analyze sentiment."
            }

sentiment_agent = SentimentAgent()
