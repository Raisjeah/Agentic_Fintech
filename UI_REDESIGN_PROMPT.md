# 🎨 UI/UX REDESIGN PROMPT — Agentic Fintech Research Desk
# Versi 2.0 — Full Redesign

> Dokumen ini adalah instruksi lengkap untuk meredesign total UI/UX project
> Agentic Fintech yang sudah berjalan. Baca semua bagian sebelum mulai coding.

---

## 🧠 Konteks Project

Ini adalah **AI Trading Research Desk** — bukan aplikasi casual.
Target user adalah trader serius yang butuh:
- Data padat, cepat dibaca
- Sumber informasi yang transparan
- Bisa diskusi/tanya-jawab dengan AI
- Chart yang terintegrasi
- Monitoring agent secara real-time

**Vibe:** Bloomberg Terminal meets modern dark dashboard.
**Bukan:** Landing page, bukan app biasa, bukan chatbot biasa.

---

## 🏗️ LAYOUT UTAMA — Desktop First, Mobile Responsive

### Struktur Layout (3-panel)

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (fixed top, 56px)                                       │
│  [🧠 Brain] [Dashboard] [Watchlist] [History] ... [Settings]   │
├────────────┬────────────────────────────────┬───────────────────┤
│            │                                │                   │
│  SIDEBAR   │    MAIN CONTENT AREA           │   AGENT PANEL     │
│  (240px)   │    (flex-1)                    │   (320px)         │
│            │                                │                   │
│ Asset      │  [Chart Area - TradingView]    │  Agent Status     │
│ Selector   │  [Trade Plan Card]             │  Live Feed        │
│            │  [Source Panel]                │                   │
│ Watchlist  │  [Discussion Panel]            │  Discussion       │
│            │                                │  Chat             │
│ Quick      │                                │                   │
│ Stats      │                                │                   │
│            │                                │                   │
└────────────┴────────────────────────────────┴───────────────────┘
```

---

## 🎨 DESIGN SYSTEM

### Color Palette
```css
--bg-primary:     #070B14;   /* Hitam biru dalam — background utama */
--bg-surface:     #0D1321;   /* Surface card */
--bg-elevated:    #111827;   /* Elevated card / panel */
--bg-input:       #0A0F1E;   /* Input field background */

--border-subtle:  #1A2236;   /* Border halus */
--border-default: #1E2D45;   /* Border default */
--border-active:  #00D4AA;   /* Border saat aktif/focus */

--cyan-primary:   #00D4AA;   /* Aksen utama — bullish, CTA */
--cyan-dim:       #00D4AA20; /* Cyan transparan untuk background */
--red-danger:     #FF3B5C;   /* Bearish, danger, error */
--red-dim:        #FF3B5C20;
--orange-warn:    #FF8C42;   /* Warning, neutral signal */
--orange-dim:     #FF8C4220;
--yellow-caution: #F5C842;   /* Caution flags */

--text-primary:   #E8EDF5;   /* Teks utama */
--text-secondary: #8899B4;   /* Teks sekunder / label */
--text-muted:     #4A5568;   /* Teks sangat redup */
--text-code:      #00D4AA;   /* Monospace data / angka */

/* Status colors */
--status-running: #3B82F6;   /* Agent sedang berjalan */
--status-done:    #00D4AA;   /* Agent selesai */
--status-error:   #FF3B5C;   /* Agent error */
--status-idle:    #4A5568;   /* Agent standby */
```

### Typography
```css
/* Display / Header besar */
font-family: 'Space Grotesk', sans-serif;
/* Body text */
font-family: 'Inter', sans-serif;
/* Data, angka, kode, ticker */
font-family: 'JetBrains Mono', monospace;
```

Import di globals.css:
```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

---

## 📐 KOMPONEN YANG HARUS DIBUAT / DIROMBAK

---

### 1. HEADER (Baru Total)

```
File: components/layout/Header.tsx

Konten:
- Kiri  : Logo [🧠 Brain] + teks "Agentic Research Desk"
- Tengah: Nav tabs — [Dashboard] [Watchlist] [History] [Performance]
- Kanan : [🔔 Notif badge] [⚙️ Settings] [Status dot: API connected]

Style:
- Height: 56px, fixed top, z-index 50
- Background: #0D1321 dengan border-bottom #1A2236
- Glassmorphism subtle: backdrop-blur-sm
- Active tab: border-bottom 2px #00D4AA, text cyan
```

---

### 2. SIDEBAR — Asset Selector & Watchlist (Baru Total)

```
File: components/layout/Sidebar.tsx

BAGIAN 1 — Asset Search & Selector
- Search bar dengan icon 🔍
- Tab kategori: [Crypto] [Forex] [Komoditas] [Indeks]
- List aset per kategori dengan harga live & % change

Crypto list (default):
  BTC/USDT, ETH/USDT, BNB/USDT, SOL/USDT, XRP/USDT,
  DOGE/USDT, ADA/USDT, AVAX/USDT, DOT/USDT, LINK/USDT

Forex list:
  EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CHF,
  NZD/USD, USD/CAD, EUR/GBP, EUR/JPY, GBP/JPY

Komoditas:
  XAUUSD (Gold), XAGUSD (Silver), USOIL (Crude Oil),
  UKOIL (Brent Oil), NGAS (Natural Gas)

Indeks:
  US30 (Dow Jones), SPX500, NAS100, UK100, GER40, JPN225

Style tiap item:
  [ICON] [TICKER]     [PRICE]
  [NAME]              [+2.3% ▲]  ← hijau/merah sesuai arah

  Saat diklik → update Main Content Area
  Active item: border-left 2px cyan, bg cyan/10

BAGIAN 2 — Watchlist
  Header: "Watchlist" + tombol [+ Add]
  List aset yang di-pin user
  Bisa drag-drop reorder
  Klik → load analisis terakhir aset itu

BAGIAN 3 — Quick Stats (bawah sidebar)
  Total Analyses Today: 5
  Approved: 3  |  Rejected: 2
  Win Rate (30d): 67%
```

---

### 3. MAIN CONTENT AREA

#### 3a. CHART PANEL (Baru)

```
File: components/chart/ChartPanel.tsx

Gunakan TradingView Lightweight Charts (library gratis):
npm install lightweight-charts

Bukan TradingView widget embed (butuh akun premium),
tapi library chart-nya yang open source.

Data chart dari:
- Crypto: Binance WebSocket API (real-time candles)
  wss://stream.binance.com:9443/ws/btcusdt@kline_4h
- Forex: Alpha Vantage REST API (polling setiap 1 menit)
  GET /query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD

Chart features:
- Candlestick chart utama
- Volume bar di bawah
- Overlay: EMA 20 (biru), EMA 50 (oranye), EMA 200 (merah)
- Horizontal lines: Support (hijau dash), Resistance (merah dash)
- Entry zone highlight (cyan transparan)
- TP levels (garis titik hijau)
- SL level (garis merah)

Timeframe tabs di atas chart:
[15M] [1H] [4H] [1D] [1W]

Kanan atas chart:
[📊 Indicators] [🎯 Show Levels] [⛶ Fullscreen]
```

#### 3b. ANALYSIS INPUT PANEL (Redesign)

```
File: components/analysis/AnalysisForm.tsx

Layout: horizontal di atas chart, bukan card terpisah

Komponen:
1. Asset display (dari sidebar selection) — readonly, besar
2. Timeframe selector — button group: [15M][1H][4H][1D][1W]
3. Goal selector — dropdown: [Scalping][Day Trade][Swing Trade][Position]
4. Capital input — dengan currency selector $
5. Risk % — slider 0.5% sampai 3%, step 0.5%
6. [⚡ Trigger Analysis] — tombol besar cyan

Tidak perlu full-page form lagi.
Ini jadi top bar di atas chart.
```

#### 3c. TRADE PLAN CARD (Redesign Total)

```
File: components/analysis/TradePlanCard.tsx

Layout 2-kolom:

KIRI — Trade Info:
┌─────────────────────────────────────┐
│  BTC/USDT  4H           BULLISH 🟢  │
│  Confidence: ████████░░ 74%         │
│  Signal: MODERATE                   │
├─────────────────────────────────────┤
│  📖 THESIS                          │
│  "Setup ini layak karena RSI bounced│
│  dari oversold, dikonfirmasi volume  │
│  spike dan berita ETF inflow..."     │
├─────────────────────────────────────┤
│  ⚔️ COUNTER THESIS                  │
│  "Risiko: CPI release dalam 2 jam   │
│  bisa invalidate setup ini..."      │
└─────────────────────────────────────┘

KANAN — Trade Numbers:
┌─────────────────────────────────────┐
│  ENTRY ZONE                         │
│  $65,000 — $65,300                  │
│                                     │
│  STOP LOSS          RISK            │
│  $63,000            $10 (1%)        │
│                                     │
│  TAKE PROFIT                        │
│  TP1 $67,500   50% │ RR 1:1.25     │
│  TP2 $70,000   50% │ RR 1:2.5      │
│                                     │
│  POSITION SIZE                      │
│  0.00501 BTC  ≈ $325.70            │
└─────────────────────────────────────┘

BAWAH — Skenario Cards (3 kolom):
┌──────────┐ ┌──────────┐ ┌──────────┐
│ 🟢 BULL  │ │ 🟡 BASE  │ │ 🔴 BEAR  │
│ 45%      │ │ 35%      │ │ 20%      │
│          │ │          │ │          │
│ Break    │ │ Bounce   │ │ Break    │
│ 65.3k    │ │ partial  │ │ 63k →   │
│ → 70k   │ │ TP1 only │ │ invalid  │
└──────────┘ └──────────┘ └──────────┘
```

#### 3d. SOURCE PANEL (Baru — PENTING)

```
File: components/analysis/SourcePanel.tsx

Ini yang paling kurang sekarang — transparency sumber data AI.

Layout: Accordion/Tab panel di bawah Trade Plan Card

Tab: [📊 Market Data] [📰 News] [😊 Sentiment] [🌍 Macro] [📈 Technical]

Tiap tab menampilkan:

📊 Market Data Tab:
  Source: Binance API
  Fetched: 14:32:05 WIB
  ─────────────────────
  Price:   $65,234.50
  24h Vol: $28.4B
  Change:  +2.3%
  F.Rate:  0.01%
  OI:      $12.4B

📰 News Tab:
  Source: NewsAPI + CryptoPanic
  Fetched: 14:32:08 WIB
  ─────────────────────
  [🟢] BlackRock BTC ETF inflow $420M
       CoinDesk · 2 jam lalu · [↗ Link]

  [🔴] SEC investigasi exchange besar
       Reuters · 5 jam lalu · [↗ Link]

  [🟡] Fed official: "monitoring crypto"
       Bloomberg · 8 jam lalu · [↗ Link]

😊 Sentiment Tab:
  Source: Alternative.me Fear & Greed
  Fetched: 14:32:10 WIB
  ─────────────────────
  Fear & Greed Index: 68/100
  Label: GREED
  [████████░░] 68%

  Twitter/X Mentions: 142K (24h)
  Trend: ↑ +23% dari kemarin

🌍 Macro Tab:
  Source: FRED API + ForexFactory
  Fetched: 14:32:12 WIB
  ─────────────────────
  DXY:      102.4  ↓ -0.3%
  Gold:     $2,340 ↑ +0.8%
  10Y Yield: 4.32% ↓

  Upcoming Events:
  ⚠️ CPI Data    · 16:30 WIB · HIGH IMPACT
  ⚠️ Fed Minutes · BESOK     · HIGH IMPACT

📈 Technical Tab:
  Calculated by: pandas-ta
  Based on: 200 candles 4H
  ─────────────────────
  RSI(14):     52.3  → Neutral
  MACD:        Cross ↑ (Bullish)
  EMA 20:      $64,800  (Price above ✓)
  EMA 50:      $63,200  (Price above ✓)
  EMA 200:     $58,400  (Price above ✓)
  Bollinger:   Mid band, room to upper
  Pattern:     Higher Low formation
  S/R:         Support $63k | Resist $67.5k
```

---

### 4. DISCUSSION / CHAT PANEL (Baru — PENTING)

```
File: components/discussion/DiscussionPanel.tsx

Ini fitur "saling berdiskusi di dashboard" yang diminta.

Letaknya: Panel kanan (320px) ATAU tab di bawah source panel

Konsep:
- Setelah analisis selesai, user bisa tanya ke AI tentang analisis itu
- AI menjawab dengan konteks penuh dari hasil semua agent
- History diskusi tersimpan per analisis

UI Layout:
┌─────────────────────────────────────┐
│  💬 Diskusi dengan AI               │
│  Konteks: BTC/USDT 4H Analysis     │
├─────────────────────────────────────┤
│                                     │
│  🤖 AI Research Desk                │
│  ┌─────────────────────────────┐   │
│  │ Analisis selesai. Setup ini │   │
│  │ menunjukkan bias BULLISH    │   │
│  │ dengan confidence 74%.      │   │
│  │ Ada yang ingin kamu tanyakan│   │
│  │ tentang setup ini?          │   │
│  └─────────────────────────────┘   │
│                                     │
│  👤 Kamu                            │
│  ┌─────────────────────────────┐   │
│  │ Kenapa entry zone di 65k?   │   │
│  │ Bukan di 64.5k?             │   │
│  └─────────────────────────────┘   │
│                                     │
│  🤖 AI Research Desk                │
│  ┌─────────────────────────────┐   │
│  │ Entry zone 65k-65.3k        │   │
│  │ dipilih karena:             │   │
│  │ 1. Confluence EMA 20 ($64.8k│   │
│  │ 2. Previous resistance flip │   │
│  │ 3. Volume cluster di area itu│  │
│  │ 64.5k lebih agresif tapi    │   │
│  │ di bawah EMA 20, riskier.   │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [Tanya tentang analisis ini...]  [→]│
└─────────────────────────────────────┘

Preset questions (chip buttons):
[Kenapa entry di sini?]
[Bagaimana kalau CPI naik?]
[Kapan invalidate setup ini?]
[Berapa probability profit?]
[Saran timeframe lebih pendek?]

Backend endpoint baru:
POST /api/analysis/:id/discuss
Body: { "question": "..." }
Response: { "answer": "...", "sources": [...] }

LLM yang dipakai: Gemini Flash
System prompt: inject semua hasil agent sebagai konteks
```

---

### 5. AGENT STATUS PANEL (Redesign)

```
File: components/agents/AgentStatusPanel.tsx

Tampilkan di sidebar kanan atau modal saat analysis running.

Layout — Terminal-style:

┌─────────────────────────────────────┐
│  ⚡ AGENT ACTIVITY                  │
│  BTC/USDT Analysis · Running...    │
├─────────────────────────────────────┤
│                                     │
│  ✅ Planner Agent      0.3s        │
│  ✅ Data Agent         1.2s        │
│  ✅ News Agent         2.1s        │
│  🔄 Sentiment Agent    running...  │  ← animasi pulse
│  ⏳ Macro Agent        waiting     │
│  ⏳ Technical Agent    waiting     │
│  ⏳ Risk Agent         waiting     │
│  ⏳ Thesis Agent       waiting     │
│  ⏳ Synthesizer        waiting     │
│  ⏳ Scenario Agent     waiting     │
│  ⏳ Money Mgmt         waiting     │
│  ⏳ Reviewer Agent     waiting     │
│                                     │
│  Progress: ████████░░░░ 4/12       │
│                                     │
│  Live Log:                          │
│  14:32:05 [DATA]  Fetched OHLCV ✓  │
│  14:32:07 [NEWS]  3 articles found │
│  14:32:09 [SENT]  Analyzing...     │
└─────────────────────────────────────┘

Warna status:
- ✅ done: #00D4AA
- 🔄 running: #3B82F6 + pulse animation
- ⏳ waiting: #4A5568
- ❌ error: #FF3B5C
```

---

### 6. HISTORY PAGE (Redesign Total)

```
File: app/history/page.tsx

Layout:

SECTION 1 — Stats Bar (top)
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ TOTAL    │ WIN RATE │ AVG CONF │ APPROVED │ REJECTED │
│ 24       │ 67%      │ 71%      │ 18       │ 6        │
│ analyses │ (30d)    │ score    │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┘

SECTION 2 — Performance Chart
Line chart: Win Rate over time (last 30 hari)
Bar chart: Analyses per day

SECTION 3 — Filter Bar
[All] [Crypto] [Forex] | [All] [Approved] [Rejected] | Date range

SECTION 4 — History Table (card style, bukan table flat)
Tiap row jadi mini-card:

┌─────────────────────────────────────────────────────────┐
│  BTC/USDT  4H  SWING          15 Jun 2026, 14:32 WIB   │
│  🟢 BULLISH  Confidence: 74%  ✅ Approved               │
│  Entry: $65k  TP: $70k  SL: $63k  RR: 1:2.5           │
│  Outcome: [WIN ✓] / [LOSS ✗] / [Pending — input hasil] │
│                                            [View Detail]│
└─────────────────────────────────────────────────────────┘

Outcome input:
Jika masih "Pending", tampilkan button:
[✓ Mark as WIN] [✗ Mark as LOSS] [— Skip/Invalid]
```

---

### 7. WATCHLIST PAGE (Baru)

```
File: app/watchlist/page.tsx

Halaman untuk menyimpan aset favorit dan monitor secara pasif.

Layout:
- Grid card per aset
- Setiap card: nama, harga live, % change, chart mini (sparkline)
- Tombol [🔍 Analyze Now] di tiap card
- Alert: bisa set price alert untuk tiap aset
- Notif ke Telegram saat harga mencapai alert level
```

---

## 🔌 INTEGRASI CHART — TradingView Lightweight Charts

```bash
npm install lightweight-charts
```

```typescript
// components/chart/ChartPanel.tsx
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

// Untuk Crypto — Binance WebSocket
const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_4h');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const candle = data.k;
  series.update({
    time: candle.t / 1000,
    open: parseFloat(candle.o),
    high: parseFloat(candle.h),
    low: parseFloat(candle.l),
    close: parseFloat(candle.c),
  });
};

// Untuk Forex — Alpha Vantage polling
// GET https://www.alphavantage.co/query?function=FX_INTRADAY
//     &from_symbol=EUR&to_symbol=USD&interval=60min&apikey=KEY

// Overlay levels dari analisis AI:
// Entry zone — cyan highlight area
// TP levels — horizontal line hijau titik-titik
// SL level — horizontal line merah solid
// Support/Resistance — garis abu-abu dash
```

---

## 📡 BACKEND TAMBAHAN YANG DIBUTUHKAN

### Endpoint Baru

```python
# 1. Discussion endpoint
POST /api/analysis/{id}/discuss
Request:  { "question": str }
Response: { "answer": str, "sources": list, "timestamp": str }

# 2. Watchlist endpoints
GET    /api/watchlist
POST   /api/watchlist          # { "asset": "BTC/USDT", "category": "crypto" }
DELETE /api/watchlist/{asset}

# 3. Price alert endpoints
GET    /api/alerts
POST   /api/alerts             # { "asset": "BTC/USDT", "price": 70000, "direction": "above" }
DELETE /api/alerts/{id}

# 4. Live price endpoint (untuk sidebar)
GET /api/prices?assets=BTC/USDT,ETH/USDT,EUR/USD
Response: [{ asset, price, change_24h, change_pct }]

# 5. Performance stats
GET /api/performance?period=30d
Response: { win_rate, total, wins, losses, avg_confidence, by_asset[] }
```

### Discussion Agent (Backend)

```python
# backend/agents/discussion_agent.py

async def discuss(analysis_id: str, question: str) -> str:
    """
    Inject full analysis context ke LLM,
    lalu jawab pertanyaan user tentang analisis itu.
    """
    # 1. Load analysis dari MongoDB
    analysis = await db.analyses.find_one({"_id": analysis_id})
    
    # 2. Build context
    context = f"""
    Kamu adalah AI Research Desk yang baru menyelesaikan analisis:
    
    Asset: {analysis['asset']}
    Timeframe: {analysis['timeframe']}
    Bias: {analysis['report']['overall_bias']}
    Confidence: {analysis['report']['confidence']}%
    
    Technical: {analysis['report']['sources']['technical']}
    Sentiment: {analysis['report']['sources']['sentiment']}
    News: {analysis['report']['sources']['news']}
    Macro: {analysis['report']['sources']['macro']}
    
    Trade Plan:
    Entry: {analysis['report']['entry_plan']}
    SL: {analysis['report']['stop_loss']}
    TP: {analysis['report']['take_profit']}
    
    Scenarios: {analysis['report']['scenarios']}
    Risk Flags: {analysis['report']['risk_flags']}
    """
    
    # 3. Generate answer
    response = await gemini_client.generate(
        system=context,
        user=question
    )
    
    return response
```

---

## 📱 MOBILE RESPONSIVENESS

```
Desktop (>1024px): 3-panel layout (sidebar + main + agent panel)
Tablet (768-1024px): 2-panel (sidebar collapse jadi icon, main + agent)
Mobile (<768px): single panel, bottom tab navigation

Bottom tab bar untuk mobile:
[📊 Dashboard] [👁️ Watchlist] [📈 History] [⚙️ Settings]
```

---

## 🚀 URUTAN IMPLEMENTASI

### Phase A — Layout & Navigation (mulai dari sini)
1. Buat `components/layout/Header.tsx` dengan nav
2. Buat `components/layout/Sidebar.tsx` dengan asset list
3. Update `app/layout.tsx` jadi 3-panel structure
4. Buat asset list data (crypto + forex + komoditas)

### Phase B — Chart Integration
5. Install `lightweight-charts`
6. Buat `components/chart/ChartPanel.tsx`
7. Integrasi Binance WebSocket untuk crypto
8. Integrasi Alpha Vantage polling untuk forex
9. Overlay levels dari analisis AI

### Phase C — Source Panel & Transparency
10. Buat `components/analysis/SourcePanel.tsx`
11. Update backend untuk return raw sources per agent
12. Tampilkan tiap tab dengan data dan link sumber

### Phase D — Discussion Panel
13. Buat backend endpoint `POST /api/analysis/:id/discuss`
14. Buat `components/discussion/DiscussionPanel.tsx`
15. Buat `backend/agents/discussion_agent.py`

### Phase E — History & Watchlist
16. Redesign `app/history/page.tsx`
17. Buat `app/watchlist/page.tsx`
18. Buat watchlist dan alert endpoints

---

## ⚠️ ATURAN CODING

1. **Semua komponen TypeScript** — tidak ada `.js` untuk komponen baru
2. **Pakai Tailwind** — tidak ada inline style kecuali untuk chart canvas
3. **Async/await** — tidak ada `.then()` chain
4. **Loading states** — semua fetch harus punya skeleton loader
5. **Error states** — semua komponen harus handle error gracefully
6. **No hardcode API keys** — semua dari `process.env`
7. **Responsive** — semua komponen harus work di mobile
8. **Font JetBrains Mono** untuk semua angka harga/data
9. **Animasi** — gunakan Tailwind `animate-pulse` untuk loading agent
10. **WebSocket** — reconnect otomatis jika disconnect

---
*UI_REDESIGN_PROMPT.md v2.0*
*Agentic Fintech Research Desk*
*Juni 2026*
