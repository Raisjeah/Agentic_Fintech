import os
from enum import Enum
from google import genai
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
        
    def generate(self, prompt: str) -> str:
        if self.provider == LLMProvider.GEMINI:
            if not gemini_client:
                raise ValueError("GEMINI_API_KEY is not set.")
            response = gemini_client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text
        else:
            raise NotImplementedError("Anthropic provider not implemented yet for Phase 1 MVP")

def get_llm_client(provider: LLMProvider = LLMProvider.GEMINI, task: str = "fast"):
    return LLMClient(provider=provider, task=task)
