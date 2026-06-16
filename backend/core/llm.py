import os
from enum import Enum
from google import genai
from google.genai import types
from core.config import settings

class LLMProvider(Enum):
    GEMINI = "gemini"
    ANTHROPIC = "anthropic"

# Configure Gemini Client
gemini_client = None
if settings.GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)

MODELS = {
    "gemini": {
        "fast": "gemini-2.5-flash",
        "smart": "gemini-2.5-flash"
    }
}

class LLMClient:
    def __init__(self, provider: LLMProvider = LLMProvider.GEMINI, task: str = "fast"):
        self.provider = provider
        self.task = task
        self.model_name = MODELS[provider.value][task]
        
    def _get_gemini_config(self, system_instruction: str = None, temperature: float = 0.2):
        # Global Project Context / "RAG" Knowledge Base for all agents
        global_context = """
        PROJECT CONTEXT: You are part of 'Agentic Fintech', an advanced LangGraph-based AI Trading Research Desk.
        Your workflow involves analyzing technicals, sentiment, macroeconomics, debating (Bull vs Bear), and formulating rigorous Trade Plans (Entry, SL, TP) for the USER.
        Do not hallucinate data; strictly use the JSON data provided in the prompts.
        Always output raw JSON without markdown blocks when requested.
        """
        
        final_system_instruction = system_instruction if system_instruction else global_context
        if system_instruction:
            final_system_instruction = f"{global_context}\n\nYOUR SPECIFIC ROLE:\n{system_instruction}"

        config_kwargs = {
            "max_output_tokens": 8192,
            "temperature": temperature,
            "system_instruction": final_system_instruction,
            "safety_settings": [
                types.SafetySetting(
                    category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold=types.HarmBlockThreshold.BLOCK_NONE,
                ),
                types.SafetySetting(
                    category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold=types.HarmBlockThreshold.BLOCK_NONE,
                ),
                types.SafetySetting(
                    category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold=types.HarmBlockThreshold.BLOCK_NONE,
                ),
                types.SafetySetting(
                    category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold=types.HarmBlockThreshold.BLOCK_NONE,
                ),
            ]
        }
        if system_instruction:
            config_kwargs["system_instruction"] = system_instruction
            
        return types.GenerateContentConfig(**config_kwargs)
        
    def generate(self, prompt: str, system_instruction: str = None, temperature: float = 0.2) -> str:
        if self.provider == LLMProvider.GEMINI:
            if not gemini_client:
                raise ValueError("GEMINI_API_KEY is not set.")
            response = gemini_client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=self._get_gemini_config(system_instruction, temperature)
            )
            return response.text
        else:
            raise NotImplementedError("Anthropic provider not implemented yet for Phase 1 MVP")

    async def generate_async(self, prompt: str, system_instruction: str = None, temperature: float = 0.2) -> str:
        if self.provider == LLMProvider.GEMINI:
            if not gemini_client:
                raise ValueError("GEMINI_API_KEY is not set.")
            response = await gemini_client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=self._get_gemini_config(system_instruction, temperature)
            )
            return response.text
        else:
            raise NotImplementedError("Anthropic provider not implemented yet for Phase 1 MVP")

def get_llm_client(provider: LLMProvider = LLMProvider.GEMINI, task: str = "fast"):
    return LLMClient(provider=provider, task=task)
