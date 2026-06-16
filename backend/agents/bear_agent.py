import os
import json
import asyncio
from typing import Dict, Any
from core.llm import get_llm_client, LLMProvider

class BearAgent:
    def __init__(self):
        self.llm = get_llm_client(provider=LLMProvider.GEMINI, task="fast")
        
    async def argue_bearish(self, asset: str, tech_output: Dict[str, Any], macro_output: Dict[str, Any], risk_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Argue for a bearish scenario based on risk, macro, and technical data.
        """
        prompt = f"""
        You are a Bearish Agent. Formulate the best possible bearish argument for {asset}.
        Use the following technical, macro, and risk data to build your case:
        
        Technical Data: {json.dumps(tech_output, indent=2)}
        Macro Data: {json.dumps(macro_output, indent=2)}
        Risk Data: {json.dumps(risk_output, indent=2)}
        
        Provide a JSON response exactly in this format:
        {{
            "argument": "Compelling bearish argument paragraph...",
            "confidence": 0-100 (integer representing confidence in bearish setup),
            "key_points": ["point 1", "point 2", "point 3"]
        }}
        Do not include markdown blocks, just raw JSON.
        """
        try:
            llm_res = await self.llm.generate_async(prompt)
            if llm_res.startswith("```json"):
                llm_res = llm_res[7:-3]
            elif llm_res.startswith("```"):
                llm_res = llm_res[3:-3]
            parsed_res = json.loads(llm_res.strip())
            return {
                "argument": parsed_res.get("argument", "Bearish argument not generated."),
                "confidence": parsed_res.get("confidence", 50),
                "key_points": parsed_res.get("key_points", [])
            }
        except Exception as e:
            print(f"BearAgent LLM parsing error: {e}")
            return {
                "argument": "Failed to generate bearish argument due to LLM error.",
                "confidence": 50,
                "key_points": []
            }

bear_agent = BearAgent()
