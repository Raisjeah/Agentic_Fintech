import os
import json
import asyncio
from typing import Dict, Any
from core.llm import get_llm_client, LLMProvider

class DebateModerator:
    def __init__(self):
        self.llm = get_llm_client(provider=LLMProvider.GEMINI, task="fast")
        
    async def moderate(self, asset: str, bull_output: Dict[str, Any], bear_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Moderate the debate between BullAgent and BearAgent, summarizing and deciding a winner.
        """
        prompt = f"""
        You are a Debate Moderator for a trading research desk. Analyze the debate for {asset}.
        
        Bullish Arguments:
        {json.dumps(bull_output, indent=2)}
        
        Bearish Arguments:
        {json.dumps(bear_output, indent=2)}
        
        Provide a JSON response exactly in this format:
        {{
            "winner": "BULL|BEAR|NEUTRAL",
            "bull_score": 0-100 (integer representing validity/conviction score of bull points),
            "bear_score": 0-100 (integer representing validity/conviction score of bear points),
            "debate_summary": "A concise summary of the debate, highlighting the key conflicting elements...",
            "final_position": "BULLISH|BEARISH|NEUTRAL"
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
                "winner": parsed_res.get("winner", "NEUTRAL"),
                "bull_score": parsed_res.get("bull_score", 50),
                "bear_score": parsed_res.get("bear_score", 50),
                "debate_summary": parsed_res.get("debate_summary", "No debate summary generated."),
                "final_position": parsed_res.get("final_position", "NEUTRAL")
            }
        except Exception as e:
            print(f"DebateModerator LLM parsing error: {e}")
            return {
                "winner": "NEUTRAL",
                "bull_score": 50,
                "bear_score": 50,
                "debate_summary": "Moderation failed due to LLM error.",
                "final_position": "NEUTRAL"
            }

debate_moderator = DebateModerator()
