# 🧠 Agentic AI Trading Research Desk — BLUEPRINT v1.0

> **Dokumen ini adalah blueprint lengkap untuk digunakan sebagai prompt ke Claude Code, Codex, atau AI coding assistant lainnya.**
> Baca seluruh dokumen sebelum mulai generate code.

---

## 📌 Deskripsi Project

Sebuah sistem **multi-agent AI** yang berfungsi sebagai "research desk" untuk trading Forex dan Crypto. Sistem ini **bukan** auto-trading bot — AI hanya menganalisis dan menyajikan data, keputusan eksekusi tetap di tangan user.

**Tagline:** *"AI yang berpikir, Manusia yang memutuskan."*

---

## 🎯 Tujuan Sistem

1. User memilih aset, timeframe, modal, dan risk tolerance
2. Orchestrator membagi tugas ke agent-agent spesialis
3. Setiap agent mengambil data dari sumber berbeda secara paralel
4. Synthesizer menggabungkan semua hasil menjadi trade plan lengkap
5. Output dikirim ke Web Dashboard dan Telegram
6. User mereview dan approve/reject secara manual
7. Jika approve, user eksekusi sendiri di exchange/broker

---

## 🗂️ Struktur Folder Project

```
agentic-trading/
├── backend/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── planner.py           # Decompose request → task queue
│   │   ├── data_agent.py        # Market data (OHLCV, volume, dll)
│   │   ├── news_agent.py        # Scraping berita & headline
│   │   ├── sentiment_agent.py   # Analisis sentimen pasar
│   │   ├── macro_agent.py       # Data ekonomi makro
│   │   ├── technical_agent.py   # Indikator teknikal & pattern
│   │   ├── risk_agent.py        # Volatilitas & event risk
│   │   ├── thesis_agent.py      # Trade thesis generator
│   │   ├── synthesizer.py       # Gabungkan semua output
│   │   ├── scenario_agent.py    # Bull/Base/Bear scenarios
│   │   ├── money_agent.py       # Position sizing & MM
│   │   └── reviewer.py          # Format output jadi card
│   ├── orchestrator/
│   │   ├── __init__.py
│   │   ├── graph.py             # LangGraph state machine
│   │   └── scheduler.py         # APScheduler cron jobs
│   ├── connectors/
│   │   ├── __init__.py
│   │   ├── telegram_bot.py      # Telegram Bot notifikasi
│   │   └── webhook.py           # Webhook endpoint
│   ├── models/
│   │   ├── __init__.py
│   │   ├── task.py              # MongoDB task schema
│   │   ├── report.py            # MongoDB report schema
│   │   └── audit.py             # MongoDB audit log schema
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── routes/
│   │   │   ├── analysis.py      # POST /analyze, GET /analysis/:id
│   │   │   ├── approval.py      # POST /approve, POST /reject
│   │   │   ├── history.py       # GET /history
│   │   │   └── status.py        # GET /agents/status (WebSocket)
│   │   └── middleware.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Environment variables & settings
│   │   ├── llm.py               # LLM client factory (Gemini/Anthropic/OpenAI)
│   │   └── logger.py            # Structured logging
│   └── audit/
│       ├── __init__.py
│       └── logger.py            # Audit trail layer
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Redirect ke dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Main dashboard
│   │   ├── analysis/
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # Form input analisis baru
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Detail hasil analisis
│   │   └── history/
│   │       └── page.tsx         # Riwayat analisis & performa
│   ├── components/
│   │   ├── ui/                  # Shadcn/ui components
│   │   ├── AgentStatusCard.tsx  # Status tiap agent real-time
│   │   ├── TradePlanCard.tsx    # Output trade plan lengkap
│   │   ├── ScenarioCard.tsx     # Bull/Base/Bear scenario
│   │   ├── ApprovalPanel.tsx    # Tombol approve/reject/retry
│   │   ├── MoneyManagement.tsx  # Position size display
│   │   └── ConfidenceGauge.tsx  # Visual confidence score
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   └── websocket.ts         # WebSocket client
│   └── hooks/
│       ├── useAgentStatus.ts
│       └── useAnalysis.ts
├── .env.example
├── docker-compose.yml
├── pyproject.toml               # uv project config
├── package.json
└── README.md
```

---

## 🤖 Agent Specification

### 1. Planner Agent
```
Tugas    : Menerima input user, memecah jadi task queue terstruktur
Input    : { asset, timeframe, goal, capital, risk_percent }
Output   : List task dengan agent assignment dan prioritas
LLM      : Gemini Flash
Prompt   : Decompose trading analysis request menjadi task list JSON
```

### 2. Data Agent
```
Tugas    : Fetch market data real-time
Input    : { asset, timeframe }
Output   : { ohlcv[], volume, funding_rate, open_interest, price_change_24h }
Tools    : Binance API (Crypto), Alpha Vantage / Twelve Data (Forex)
LLM      : Tidak perlu LLM, pure API call + data parsing
Free API : Binance public endpoint (no key), Alpha Vantage free tier
```

### 3. News Agent
```
Tugas    : Scraping berita & headline relevan
Input    : { asset, timeframe }
Output   : { headlines[{ title, source, sentiment_tag, url, time }], summary }
Tools    : NewsAPI (free tier), CryptoPanic API, RSS feed parsing
LLM      : Gemini Flash — summarize dan tag sentiment per artikel
Free API : NewsAPI 100req/day, CryptoPanic free
```

### 4. Sentiment Agent
```
Tugas    : Nilai sentimen pasar secara keseluruhan
Input    : { asset, news_output }
Output   : { score: 0-100, label: "Bullish/Bearish/Neutral", breakdown }
Tools    : Fear & Greed Index API, social mention parsing
LLM      : Gemini Flash — analisis sentimen gabungan
Free API : alternative.me (Fear & Greed), CryptoPanic
```

### 5. Macro Agent
```
Tugas    : Monitor data ekonomi makro dan kalender event
Input    : { asset_type: "forex/crypto", timeframe }
Output   : { events[{ name, time, impact, forecast, previous }], assessment }
Tools    : FRED API, Investing.com calendar scrape, ForexFactory RSS
LLM      : Gemini Flash — interpretasi dampak event ke aset
Free API : FRED API (free), ForexFactory RSS
```

### 6. Technical Agent
```
Tugas    : Kalkulasi indikator teknikal dan identifikasi pattern
Input    : { ohlcv[], timeframe }
Output   : {
             rsi, macd, ema_20, ema_50, ema_200,
             bb_upper, bb_lower,
             support[], resistance[],
             pattern: "Double Bottom / Head & Shoulders / etc",
             signal: "BUY/SELL/NEUTRAL",
             strength: "STRONG/MODERATE/WEAK"
           }
Tools    : pandas-ta library (Python)
LLM      : Gemini Flash — interpretasi gabungan indikator
```

### 7. Risk Agent
```
Tugas    : Evaluasi risiko event, volatilitas, dan red flags
Input    : { ohlcv[], macro_output, news_output }
Output   : {
             atr, volatility_level: "HIGH/MEDIUM/LOW",
             red_flags[],
             event_risk: bool,
             risk_score: 0-100,
             recommendation: "PROCEED/WAIT/AVOID"
           }
LLM      : Gemini Flash — identifikasi dan weight risk factors
```

### 8. Thesis Agent
```
Tugas    : Bangun narasi kenapa setup ini layak (atau tidak)
Input    : { semua output agent sebelumnya }
Output   : { thesis: string, counter_thesis: string, conviction: "HIGH/MED/LOW" }
LLM      : Claude Sonnet atau Gemini Flash — reasoning & narasi
```

### 9. Synthesizer Agent
```
Tugas    : Gabungkan semua output, conflict check, final bias
Input    : { semua output agent }
Output   : {
             overall_bias: "BULLISH/BEARISH/NEUTRAL/MIXED",
             confidence: 0-100,
             signal_strength: "STRONG/MODERATE/WEAK",
             trade_valid: "YES/WAIT/NO",
             conflict_flags[],
             reasoning: string
           }
LLM      : Claude Sonnet — synthesis & reasoning terbaik
```

### 10. Scenario Agent
```
Tugas    : Buat 3 skenario trading
Input    : { synthesizer_output, technical_output, price_data }
Output   : {
             bull: { trigger, entry, tp1, tp2, tp3, probability },
             base: { trigger, entry, tp1, exit, probability },
             bear: { trigger, invalidation, action, probability }
           }
LLM      : Gemini Flash
```

### 11. Money Management Agent
```
Tugas    : Kalkulasi position sizing berdasarkan risk management
Input    : { capital, risk_percent, entry, stop_loss, asset }
Output   : {
             risk_amount,
             position_size,
             lot_size,
             rr_ratio,
             max_loss,
             tp_levels[{ price, size_percent }]
           }
Formula  : risk_amount = capital × risk_percent
           position_size = risk_amount / (entry - stop_loss)
LLM      : Tidak perlu, pure kalkulasi matematis
```

### 12. Reviewer Agent
```
Tugas    : Format semua output jadi trade plan card yang readable
Input    : { semua output }
Output   : Formatted JSON untuk frontend + Telegram message
LLM      : Gemini Flash — format & copywriting ringkasan
```

---

## 🔄 Orchestrator Workflow (LangGraph)

```python
# State definition
class TradingState(TypedDict):
    # Input
    asset: str
    timeframe: str
    goal: str
    capital: float
    risk_percent: float

    # Agent outputs
    tasks: list
    market_data: dict
    news_data: dict
    sentiment_data: dict
    macro_data: dict
    technical_data: dict
    risk_data: dict
    thesis_data: dict
    synthesis: dict
    scenarios: dict
    money_management: dict
    final_report: dict

    # Meta
    status: str
    errors: list
    created_at: str
    valid_until: str  # +15 menit dari created_at

# Graph flow
START
  → planner_node
  → [data_node, news_node, sentiment_node, macro_node, technical_node]  # PARALEL
  → risk_node
  → thesis_node
  → synthesizer_node
  → scenario_node
  → money_management_node
  → reviewer_node
  → notify_node  # Push ke WebSocket + Telegram
END
```

---

## 🌐 API Endpoints (FastAPI)

```
POST   /api/analyze              # Trigger analisis baru
GET    /api/analysis/:id         # Get hasil analisis by ID
GET    /api/analysis/:id/status  # Get status real-time
POST   /api/analysis/:id/approve # User approve trade plan
POST   /api/analysis/:id/reject  # User reject dengan alasan
POST   /api/analysis/:id/retry   # Re-trigger analisis
GET    /api/history              # Riwayat semua analisis
GET    /api/history/performance  # Track akurasi rekomendasi AI
WS     /ws/agents                # WebSocket agent status live
```

### Request Schema — POST /api/analyze
```json
{
  "asset": "BTC/USDT",
  "timeframe": "4H",
  "goal": "swing_trade",
  "capital": 1000,
  "risk_percent": 1.0
}
```

### Response Schema — Trade Plan
```json
{
  "id": "uuid",
  "status": "completed",
  "valid_until": "2026-06-15T14:47:00Z",
  "overall_bias": "BULLISH",
  "confidence": 74,
  "signal_strength": "MODERATE",
  "trade_valid": "YES",
  "reasoning": "...",
  "thesis": "...",
  "counter_thesis": "...",
  "entry_plan": {
    "zone_low": 65000,
    "zone_high": 65300
  },
  "stop_loss": 63000,
  "take_profit": [
    { "level": 1, "price": 67500, "size_percent": 50 },
    { "level": 2, "price": 70000, "size_percent": 50 }
  ],
  "rr_ratio": 2.5,
  "money_management": {
    "risk_amount": 10,
    "position_size": 325.7,
    "lot_size": 0.00501,
    "max_loss": 10
  },
  "scenarios": {
    "bull": { "trigger": "Break 65.3k", "target": "70k", "probability": 45 },
    "base": { "trigger": "Bounce di 65k", "target": "67.5k", "probability": 35 },
    "bear": { "trigger": "Break 63k", "action": "Invalidated", "probability": 20 }
  },
  "risk_flags": [
    "CPI release dalam 3 jam",
    "ATR tinggi (2.8%)"
  ],
  "sources": {
    "technical": { "rsi": 52, "macd": "bullish_cross", "ema": "above_20_50" },
    "sentiment": { "score": 68, "label": "Bullish" },
    "news": { "top_headline": "...", "sentiment_tag": "Positive" },
    "macro": { "dxy_trend": "weakening", "upcoming_event": "CPI" }
  },
  "created_at": "2026-06-15T14:32:00Z"
}
```

---

## 💾 MongoDB Schemas

### Collection: `analyses`
```json
{
  "_id": "ObjectId",
  "user_input": { "asset", "timeframe", "goal", "capital", "risk_percent" },
  "status": "pending | running | completed | failed",
  "agent_statuses": {
    "data_agent": "idle | running | done | error",
    "news_agent": "...",
    "..."
  },
  "report": { /* full trade plan JSON */ },
  "created_at": "ISODate",
  "valid_until": "ISODate",
  "approved_at": null,
  "approval_status": "pending | approved | rejected | expired"
}
```

### Collection: `audit_logs`
```json
{
  "_id": "ObjectId",
  "analysis_id": "ref",
  "action": "approved | rejected | re_analyzed",
  "reason": "string (optional)",
  "timestamp": "ISODate",
  "outcome": null  // diisi manual user setelah trade selesai
}
```

---

## 🔑 Environment Variables (.env)

```env
# LLM APIs
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key  # optional

# LLM Config
PRIMARY_LLM=gemini                  # gemini | anthropic | openai
SYNTHESIS_LLM=anthropic             # LLM khusus untuk synthesizer & thesis

# Market Data
BINANCE_API_KEY=your_binance_key    # optional, public endpoint tersedia
BINANCE_SECRET=your_binance_secret
ALPHA_VANTAGE_KEY=your_av_key       # Forex data
TWELVE_DATA_KEY=your_td_key         # Forex alternative

# News & Sentiment
NEWS_API_KEY=your_newsapi_key
CRYPTOPANIC_API_KEY=your_cp_key

# Macro
FRED_API_KEY=your_fred_key

# Database
MONGODB_URI=mongodb://localhost:27017/agentic_trading

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# App
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
ANALYSIS_VALIDITY_MINUTES=15
MAX_CONCURRENT_ANALYSES=3
```

---

## 🤖 LLM Client Factory

```python
# backend/core/llm.py
# Mendukung Gemini, Anthropic, OpenAI secara bergantian

from enum import Enum

class LLMProvider(Enum):
    GEMINI = "gemini"
    ANTHROPIC = "anthropic"
    OPENAI = "openai"

def get_llm_client(provider: LLMProvider = None, task: str = "general"):
    """
    task bisa: "fast" (pakai Gemini Flash), "synthesis" (pakai Claude Sonnet)
    Fallback otomatis jika quota habis.
    """
    pass

# Model mapping
MODELS = {
    "gemini": {
        "fast": "gemini-2.0-flash-exp",       # Free tier
        "smart": "gemini-1.5-pro"
    },
    "anthropic": {
        "fast": "claude-haiku-4-5-20251001",
        "smart": "claude-sonnet-4-6"
    },
    "openai": {
        "fast": "gpt-4o-mini",
        "smart": "gpt-4o"
    }
}
```

---

## 📱 Telegram Bot Format

### Notifikasi saat analisis selesai:
```
🧠 AGENTIC TRADING DESK
━━━━━━━━━━━━━━━━━━━━━━
📊 BTC/USDT — 4H
🕐 15 Jun 2026, 14:32 WIB

BIAS: 🟢 BULLISH
CONFIDENCE: 74% | MODERATE
TRADE VALID: ✅ YES

📈 TRADE PLAN
Entry   : $65,000 – $65,300
Stop    : $63,000
TP1     : $67,500 (50%)
TP2     : $70,000 (50%)
RR      : 1 : 2.5

💰 MONEY MGMT
Risk    : $10 (1% of $1,000)
Size    : 0.00501 BTC

⚠️ RISKS
• CPI release dalam 3 jam
• Volatilitas tinggi (ATR 2.8%)

⏱ Valid: 15 menit

[🌐 Lihat Detail] → link web
━━━━━━━━━━━━━━━━━━━━━━
[✅ /approve_abc123]
[❌ /reject_abc123]
```

### Command Telegram:
```
/analyze BTC/USDT 4H    # Trigger analisis baru
/approve <id>            # Approve trade plan
/reject <id>             # Reject trade plan
/status                  # Lihat analisis aktif
/history                 # 5 analisis terakhir
```

---

## 🖥️ Web Dashboard Spec

### Halaman: `/dashboard`
- Summary semua analisis aktif (badge pending/approved/rejected)
- Agent health status (setiap agent: idle/running/done/error)
- Quick trigger form (asset + timeframe)
- Recent analyses list

### Halaman: `/analysis/new`
- Form input: Asset selector, Timeframe, Goal, Capital, Risk %
- Validasi input sebelum submit
- Loading state saat agent bekerja (real-time via WebSocket)

### Halaman: `/analysis/[id]`
- Live agent progress tracker (step by step, tiap agent)
- Full trade plan card saat selesai
- Approval panel: Approve / Reject / Re-analyze / Watch
- Detail setiap agent: data yang dipakai, confidence, source

### Halaman: `/history`
- Tabel riwayat analisis + status approval
- Field outcome (bisa diisi manual oleh user setelah trade)
- Filter by asset, status, date
- Win rate tracker berdasarkan outcome yang diinput

---

## 🎨 UI Design Direction

```
Tema    : Terminal meets Bloomberg — dark, data-dense, professional
Palette :
  - Background  : #0A0E1A (deep navy black)
  - Surface     : #111827 (dark card)
  - Border      : #1F2937
  - Primary     : #00D4AA (cyan-green, sinyal bullish)
  - Danger      : #FF4757 (merah, sinyal bearish)
  - Warning     : #FFA502 (oranye, warning/neutral)
  - Text        : #E5E7EB (primary text)
  - Muted       : #6B7280 (secondary text)

Typography:
  - Display  : JetBrains Mono (monospace, terminal feel)
  - Body     : Inter
  - Data     : JetBrains Mono (angka & kode)

Signature  : Agent progress bar yang bergerak seperti terminal log
             tiap agent muncul satu per satu dengan animasi typing
```

---

## 🐳 Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      - mongodb
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file: .env

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

---

## 🚀 Build Phases

### Phase 1 — MVP Core (prioritas pertama)
- [ ] Setup project structure (backend FastAPI + frontend Next.js)
- [ ] LLM client factory (Gemini Flash sebagai primary)
- [ ] Data Agent (Binance API)
- [ ] Technical Agent (pandas-ta)
- [ ] Synthesizer Agent (basic)
- [ ] Money Management Agent (pure math)
- [ ] Telegram Bot notifikasi
- [ ] Web Dashboard basic (input form + result card)

### Phase 2 — Enrichment
- [ ] News Agent (NewsAPI + CryptoPanic)
- [ ] Sentiment Agent (Fear & Greed + news sentiment)
- [ ] Macro Agent (FRED + economic calendar)

### Phase 3 — Intelligence
- [ ] Risk Agent
- [ ] Thesis Agent
- [ ] Scenario Agent
- [ ] Orchestrator penuh dengan LangGraph
- [ ] WebSocket real-time agent status

### Phase 4 — Polish
- [ ] History & performance tracking
- [ ] Outcome input (user bisa catat hasil trade nyata)
- [ ] Win rate analytics
- [ ] Multi-asset parallel analysis
- [ ] Watchlist & price alert

---

## ⚠️ Aturan Sistem (Hard Rules)

1. **AI tidak boleh eksekusi order otomatis** — sistem hanya output rekomendasi
2. **Setiap klaim harus punya sumber** — semua data ditampilkan source-nya
3. **Data validity 15 menit** — setelah itu analisis expired, perlu trigger ulang
4. **Semua keputusan diaudit** — log approve/reject tersimpan permanen
5. **Fallback LLM** — jika Gemini quota habis, switch ke Anthropic/OpenAI otomatis
6. **Risk Agent bisa veto** — jika risk_score > 80, sistem wajib tampilkan warning merah
7. **Conflict flag wajib ditampilkan** — jika agent berbeda pendapat, user harus tahu

---

## 📋 Prompt untuk AI Coding Assistant

Jika menggunakan dokumen ini sebagai prompt ke Claude Code / Codex:

```
Kamu adalah senior full-stack engineer yang akan membangun 
"Agentic AI Trading Research Desk" berdasarkan BLUEPRINT.md ini.

Tech stack:
- Backend : Python + FastAPI + LangGraph + pandas-ta + Motor (async MongoDB)
- Frontend: Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui
- Package manager: uv (Python), pnpm (Node.js)
- Database: MongoDB
- LLM: Google Gemini Flash (primary), Anthropic Claude Sonnet (synthesis)
- OS target: Linux (Kali), binding ke 0.0.0.0

Mulai dari Phase 1 MVP. Generate semua file yang dibutuhkan 
lengkap dengan implementasi, bukan hanya boilerplate kosong.
Gunakan async/await di seluruh backend.
Semua environment variable wajib dari .env, tidak ada hardcode.
```

---

*Blueprint v1.0 — Agentic AI Trading Research Desk*
*Last updated: Juni 2026*
