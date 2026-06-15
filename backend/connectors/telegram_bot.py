import asyncio
from telegram import Bot
from core.config import settings
from models.schema import TradePlan

class TelegramConnector:
    def __init__(self):
        self.token = settings.TELEGRAM_BOT_TOKEN
        self.chat_id = settings.TELEGRAM_CHAT_ID
        self.bot = Bot(token=self.token) if self.token else None

    async def send_trade_plan(self, asset: str, timeframe: str, plan: TradePlan):
        if not self.bot or not self.chat_id:
            print("Telegram bot not configured. Skipping notification.")
            return

        is_bullish = plan.overall_bias == "BULLISH"
        icon = "🟢" if is_bullish else "🔴" if plan.overall_bias == "BEARISH" else "🟡"
        
        message = f"""
🧠 AGENTIC TRADING DESK
━━━━━━━━━━━━━━━━━━━━━━
📊 {asset} — {timeframe}

BIAS: {icon} {plan.overall_bias}
CONFIDENCE: {plan.confidence}% | {plan.signal_strength}
TRADE VALID: {"✅" if plan.trade_valid == "YES" else "❌"} {plan.trade_valid}

📈 TRADE PLAN
Entry   : ${plan.entry_plan.get('zone_low', 0)} – ${plan.entry_plan.get('zone_high', 0)}
Stop    : ${plan.stop_loss}
RR      : 1 : {plan.rr_ratio}

💰 MONEY MGMT
Risk    : ${plan.money_management.get('risk_amount', 0):.2f}
Size    : {plan.money_management.get('position_size', 0):.4f} Units

⚠️ RISKS
{chr(10).join(['• ' + r for r in plan.risk_flags]) if plan.risk_flags else '• None'}
━━━━━━━━━━━━━━━━━━━━━━
"""
        try:
            await self.bot.send_message(chat_id=self.chat_id, text=message)
        except Exception as e:
            print(f"Failed to send telegram message: {e}")

telegram_connector = TelegramConnector()
