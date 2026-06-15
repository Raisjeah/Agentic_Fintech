import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # LLM APIs
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    PRIMARY_LLM: str = os.getenv("PRIMARY_LLM", "gemini")
    SYNTHESIS_LLM: str = os.getenv("SYNTHESIS_LLM", "anthropic")

    # DB
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/agentic_trading")

    # Telegram
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")

    class Config:
        env_file = (".env", "../.env")
        extra = "ignore"

settings = Settings()
