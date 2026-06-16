import json
from typing import Dict, Any
from core.llm import get_llm_client, LLMProvider

class ScenarioAgent:
    def __init__(self):
        self.llm = get_llm_client(provider=LLMProvider.GEMINI, task="fast")
        
    async def generate_scenarios(self, asset: str, current_price: float, synth_output: Dict[str, Any], tech_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create Bull, Base, and Bear scenarios.
        """
        prompt = f"""
        Generate 3 trading scenarios for {asset} based on the following:
        Current Price: {current_price}
        Synthesizer Bias: {synth_output.get("overall_bias")}
        Technical Signal: {tech_output.get("signal")}
        
        Provide a JSON response exactly in this format:
        {{
            "bull": {{ "trigger": "text", "entry": float, "tp1": float, "tp2": float, "probability": 0-100 }},
            "base": {{ "trigger": "text", "entry": float, "tp1": float, "exit": float, "probability": 0-100 }},
            "bear": {{ "trigger": "text", "invalidation": float, "action": "text", "probability": 0-100 }}
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
            return parsed_res
            
        except Exception as e:
            print(f"ScenarioAgent LLM parsing error: {e}")
            return {
                "bull": { "trigger": "Breakout", "entry": current_price*1.02, "tp1": current_price*1.05, "tp2": current_price*1.10, "probability": 33 },
                "base": { "trigger": "Consolidation", "entry": current_price, "tp1": current_price*1.02, "exit": current_price*0.98, "probability": 34 },
                "bear": { "trigger": "Breakdown", "invalidation": current_price*1.02, "action": "Short", "probability": 33 }
            }

scenario_agent = ScenarioAgent()
