import motor.motor_asyncio
from core.config import settings

class MongoDB:
    def __init__(self):
        self.client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
        try:
            self.db = self.client.get_default_database()
        except Exception:
            self.db = self.client["agentic_trading"]
        self.analyses = self.db.analyses
        self.chats = self.db.chats

db_client = MongoDB()
