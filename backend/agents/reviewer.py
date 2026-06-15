import json
from typing import Dict, Any
from core.llm import get_llm_client, LLMProvider

class ReviewerAgent:
    def __init__(self):
        self.llm = get_llm_client(provider=LLMProvider.GEMINI, task="fast")
        
    async def review_plan(self, synth_output: Dict, thesis_data: Dict, risk_data: Dict, mm_data: Dict) -> Dict[str, Any]:
        """
        Format output into a refined summary/reasoning using LLM.
        """
        prompt = f"""
        You are the Final Reviewer. Improve the 'reasoning' and ensure the trade plan reads professionally.
        
        Bias: {synth_output.get("overall_bias")}
        Thesis: {thesis_data.get("thesis")}
        Risk Recommendation: {risk_data.get("recommendation")}
        
        Provide a JSON response exactly in this format:
        {{
            "refined_reasoning": "A highly professional, concise 2-sentence summary of the final trade recommendation."
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
            return parsed_res
        except Exception as e:
            print(f"ReviewerAgent LLM parsing error: {e}")
            return {"refined_reasoning": synth_output.get("reasoning", "Proceed with caution.")}

reviewer_agent = ReviewerAgent()
