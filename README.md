# Agentic Fintech Research Desk

Sebuah platform riset trading pintar yang diilhami dari tampilan modern Bloomberg Terminal. Aplikasi ini dirancang menggunakan sistem **Multi-Agent Artificial Intelligence** yang mengumpulkan data pasar, berita, sentimen sosial, serta indikator teknikal untuk menghasilkan *Trading Plan* secara otonom.

AI yang berpikir. Manusia yang memutuskan.

## 🚀 Fitur Utama

- **Integrasi Multi-Agent Workflow**: Diotaki oleh sekumpulan AI Agent spesifik (Data Agent, News Agent, Sentiment Agent, Technical Agent, Macro Agent, Risk Agent, dan Reviewer) yang dirangkai menggunakan LangGraph.
- **Data Real-Time**: Terintegrasi penuh secara langsung ke WebSocket Binance untuk pergerakan harga komprehensif, serta API kustom backend untuk *data aggregator* (berita, makro, & teknikal).
- **Diskusi AI Interaktif**: Tersedia *Agent Panel* khusus untuk melakukan tanya jawab kontekstual mengenai rencana trading yang baru saja di-*generate*.
- **Modern Dark Interface**: Tampilan UI/UX premium berbasis Next.js 16+ App Router & Tailwind CSS yang sangat responsif, mendukung *Layout* mulai dari Desktop (3-panel) hingga *Mobile* (*Bottom Navigation*).

---

## 🛠️ Stack Teknologi

**Frontend:**
- Framework: Next.js 16+ (App Router)
- Bahasa: TypeScript
- Styling: Vanilla Tailwind CSS (Dark Mode Premium)
- Visualisasi Data: Lightweight Charts (TradingView)
- Package Manager: npm / pnpm

**Backend:**
- Framework: FastAPI (Python 3.11+)
- AI Orchestration: LangGraph & LangChain
- Database / State: Local Mockup Storage (dapat dihubungkan ke PostgreSQL/MongoDB)

---

## ⚙️ Cara Menjalankan Aplikasi (Instalasi & Penggunaan)

Pastikan sistem Anda telah menginstal `Node.js` (versi 18+) dan `Python` (versi 3.10+). 

### 1. Menjalankan Backend (FastAPI)
Buka terminal dan jalankan perintah berikut dari root project:
```bash
cd backend
# Aktifkan virtual environment (jika ada)
source .venv/bin/activate  # Untuk Linux/MacOS
# .venv\Scripts\activate   # Untuk Windows

# Install dependensi (jika baru pertama kali)
pip install -r requirements.txt

# Jalankan server
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend akan berjalan pada: `http://localhost:8000`

### 2. Menjalankan Frontend (Next.js)
Buka terminal baru dan jalankan perintah berikut dari root project:
```bash
cd frontend

# Install semua module (jika baru pertama kali)
npm install
# atau pnpm install

# Jalankan development server
npm run dev
# atau pnpm dev
```
Frontend akan berjalan pada: `http://localhost:3000`

### 3. Cara Menggunakan Fitur
1. Buka aplikasi pada browser: `http://localhost:3000`.
2. Di halaman Dashboard utama, tentukan instrumen aset yang diinginkan (misal: `BTC/USDT`), lalu sesuaikan profil risiko (Goal, Modal, Risiko/Trade) pada panel sebelah kiri.
3. Klik tombol **TRIGGER ANALYSIS**.
4. Biarkan Workflow LangGraph bekerja. Setelah indikator menunjukkan status selesai, rincian hasil riset (Skenario Banteng/Beruang, Rekomendasi Entry, Take Profit, dan Stop Loss) akan langsung muncul secara dinamis di layar.
5. Gunakan Sidebar diskusi (sebelah kanan) untuk membedah lebih dalam hasil analisa tersebut bersama AI.

---

## 🔄 Cara Melakukan Pembaruan (Update)

Jika ada rilis terbaru atau Anda ingin memperbarui dependensi (package/library) di dalam aplikasi, lakukan langkah-langkah berikut:

### Update Frontend:
```bash
cd frontend

# Memeriksa dependensi apa saja yang kedaluwarsa
npm outdated

# Melakukan update ke versi minor/patch terbaru sesuai package.json
npm update

# (Opsional) Build ulang aplikasi untuk memastikan tidak ada konflik atau error pada TypeScript
npm run build
```

### Update Backend:
```bash
cd backend
source .venv/bin/activate

# Jika ada perubahan library pada file requirements.txt, jalankan:
pip install -r requirements.txt --upgrade

# Jika Anda ingin menyimpan daftar library terbaru yang saat ini digunakan ke dalam requirements.txt:
pip freeze > requirements.txt
```

---

## 📄 Lisensi
Proyek ini dibuat untuk keperluan *Proof of Concept* pengembangan asisten trading berbasis *Agentic AI*. Segala risiko aktivitas *live trading* sepenuhnya ditanggung oleh pengguna akhir.
