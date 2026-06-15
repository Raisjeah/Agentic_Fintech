import json
from typing import Dict, Any
from core.llm import get_llm_client, LLMProvider

class PlannerAgent:
    def __init__(self):
        self.llm = get_llm_client(provider=LLMProvider.GEMINI, task="fast")
        
    def create_plan(self, asset: str, timeframe: str, goal: str, capital: float, risk_percent: float) -> Dict[str, Any]:
        """
        Decompose trading analysis request into task list JSON.
        """
        prompt = f"""
        You are a Trading Orchestrator Planner. Decompose this request into a task queue:
        Asset: {asset}
        Timeframe: {timeframe}
        Goal: {goal}
        Capital: {capital}
        Risk: {risk_percent}%
        
        Provide a JSON response exactly in this format:
        {{
            "request_summary": "Summary of what the user wants to achieve",
            "tasks": [
                {{"agent": "data_agent", "action": "Fetch market data", "priority": 1}},
                {{"agent": "news_agent", "action": "Fetch news headlines", "priority": 1}}
            ]
        }}
        Do not include markdown blocks, just raw JSON.
        """
        try:
            llm_res = self.llm.generate(prompt)
            if llm_res.startswith("```json"):
                llm_res = llm_res[7:-3]
            elif llm_res.startswith("```"):
                llm_res = llm_res[3:-3]
                
            return json.loads(llm_res.strip())
        except Exception as e:
            print(f"PlannerAgent LLM parsing error: {e}")
            return {
                "request_summary": f"Analyze {asset} on {timeframe}",
                "tasks": [{"agent": "all", "action": "Execute standard pipeline", "priority": 1}]
            }

planner_agent = PlannerAgent()
