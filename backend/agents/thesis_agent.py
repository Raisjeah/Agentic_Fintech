import json
from typing import Dict, Any
from core.llm import get_llm_client, LLMProvider

class ThesisAgent:
    def __init__(self):
        self.llm = get_llm_client(provider=LLMProvider.GEMINI, task="smart")
        
    async def generate_thesis(self, asset: str, data_output: Dict, tech_output: Dict, news_output: Dict, sentiment_output: Dict, macro_output: Dict, risk_output: Dict) -> Dict[str, Any]:
        """
        Build a narrative on why this setup is valid or not.
        """
        prompt = f"""
        You are a senior trading analyst. Generate a trade thesis and counter-thesis for {asset}.
        
        Data points:
        - Technical Signal: {tech_output.get('signal')} ({tech_output.get('strength')})
        - Sentiment: {sentiment_output.get('label')}
        - Risk Recommendation: {risk_output.get('recommendation')}
        - Macro Assessment: {macro_output.get('assessment')}
        
        Provide a JSON response exactly in this format:
        {{
            "thesis": "A compelling paragraph explaining the primary bull/bear case.",
            "counter_thesis": "A paragraph explaining what could go wrong and invalidate the thesis.",
            "conviction": "HIGH|MEDIUM|LOW"
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
                "thesis": parsed_res.get("thesis", "Thesis generation failed."),
                "counter_thesis": parsed_res.get("counter_thesis", "Counter-thesis generation failed."),
                "conviction": parsed_res.get("conviction", "LOW")
            }
            
        except Exception as e:
            print(f"ThesisAgent LLM parsing error: {e}")
            return {
                "thesis": "Could not generate thesis due to LLM error.",
                "counter_thesis": "Could not generate counter-thesis due to LLM error.",
                "conviction": "LOW"
            }

thesis_agent = ThesisAgent()
