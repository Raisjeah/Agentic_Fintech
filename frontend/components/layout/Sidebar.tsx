"use client";

import { useState } from "react";
import { Search, Plus, TrendingUp, TrendingDown, GripVertical } from "lucide-react";
import { useSidebar } from "./SidebarProvider";

type Category = "Crypto" | "Forex" | "Komoditas" | "Indeks";

const ASSETS: Record<Category, Array<{ ticker: string; name: string; price: string; change: number }>> = {
  Crypto: [
    { ticker: "BTC/USDT", name: "Bitcoin", price: "65,234.50", change: 2.3 },
    { ticker: "ETH/USDT", name: "Ethereum", price: "3,450.20", change: 1.5 },
    { ticker: "BNB/USDT", name: "Binance Coin", price: "590.10", change: -0.4 },
    { ticker: "SOL/USDT", name: "Solana", price: "145.30", change: 5.2 },
    { ticker: "XRP/USDT", name: "Ripple", price: "0.58", change: 0.1 },
    { ticker: "DOGE/USDT", name: "Dogecoin", price: "0.12", change: -1.2 },
    { ticker: "ADA/USDT", name: "Cardano", price: "0.45", change: 0.5 },
  ],
  Forex: [
    { ticker: "EUR/USD", name: "Euro / US Dollar", price: "1.0845", change: -0.2 },
    { ticker: "GBP/USD", name: "British Pound", price: "1.2650", change: 0.1 },
    { ticker: "USD/JPY", name: "US Dollar / Yen", price: "155.20", change: 0.4 },
    { ticker: "AUD/USD", name: "Australian Dollar", price: "0.6620", change: -0.5 },
  ],
  Komoditas: [
    { ticker: "XAUUSD", name: "Gold", price: "2,340.50", change: 0.8 },
    { ticker: "XAGUSD", name: "Silver", price: "29.50", change: 1.2 },
    { ticker: "USOIL", name: "Crude Oil", price: "82.30", change: -0.6 },
  ],
  Indeks: [
    { ticker: "US30", name: "Dow Jones", price: "38,900.50", change: 0.3 },
    { ticker: "SPX500", name: "S&P 500", price: "5,150.25", change: 0.5 },
    { ticker: "NAS100", name: "Nasdaq 100", price: "18,200.75", change: 0.7 },
  ],
};

const WATCHLIST = [
  { ticker: "BTC/USDT", change: 2.3 },
  { ticker: "XAUUSD", change: 0.8 },
  { ticker: "EUR/USD", change: -0.2 },
];

export default function Sidebar() {
  const [activeCategory, setActiveCategory] = useState<Category>("Crypto");
  const [activeAsset, setActiveAsset] = useState("BTC/USDT");
  const { isOpen } = useSidebar();

  return (
    <aside className={`${isOpen ? "w-60 border-r" : "w-0 border-r-0"} hidden md:flex flex-shrink-0 bg-[var(--bg-surface)] border-[var(--border-subtle)] flex-col h-full overflow-hidden transition-all duration-300 whitespace-nowrap`}>
      {/* Search Bar */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search assets..."
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-md py-1.5 pl-9 pr-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-primary)] transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto border-b border-[var(--border-subtle)] px-2 no-scrollbar">
        {(Object.keys(ASSETS) as Category[]).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeCategory === category
                ? "border-[var(--cyan-primary)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto">
        {ASSETS[activeCategory].map((asset) => (
          <button
            key={asset.ticker}
            onClick={() => setActiveAsset(asset.ticker)}
            className={`w-full text-left p-3 border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-elevated)] flex justify-between items-center ${
              activeAsset === asset.ticker ? "border-l-2 border-l-[var(--cyan-primary)] bg-[var(--cyan-dim)]" : "border-l-2 border-l-transparent"
            }`}
          >
            <div>
              <div className="font-mono text-sm font-medium">{asset.ticker}</div>
              <div className="text-xs text-[var(--text-secondary)] truncate max-w-[90px]">{asset.name}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm">{asset.price}</div>
              <div className={`text-xs flex items-center justify-end font-mono ${asset.change >= 0 ? "text-[var(--cyan-primary)]" : "text-[var(--red-danger)]"}`}>
                {asset.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {asset.change >= 0 ? "+" : ""}{asset.change}%
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Watchlist */}
      <div className="border-t border-[var(--border-subtle)]">
        <div className="p-3 bg-[var(--bg-elevated)] flex justify-between items-center">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Watchlist</span>
          <button className="text-[var(--cyan-primary)] hover:opacity-80 transition-opacity">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-40 overflow-y-auto">
          {WATCHLIST.map((item) => (
            <div key={item.ticker} className="flex items-center justify-between p-2 hover:bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] group cursor-pointer">
              <div className="flex items-center text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                <GripVertical className="w-3 h-3 mr-2 opacity-30 group-hover:opacity-100" />
                <span className="font-mono text-xs">{item.ticker}</span>
              </div>
              <span className={`font-mono text-xs ${item.change >= 0 ? "text-[var(--cyan-primary)]" : "text-[var(--red-danger)]"}`}>
                {item.change >= 0 ? "+" : ""}{item.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[var(--text-secondary)]">Analyses Today</span>
          <span className="font-mono text-[var(--text-primary)]">5</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-[var(--text-secondary)]">Appr/Rej</span>
          <span className="font-mono">
            <span className="text-[var(--cyan-primary)]">3</span> / <span className="text-[var(--red-danger)]">2</span>
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-[var(--text-secondary)]">Win Rate (30d)</span>
          <span className="font-mono text-[var(--cyan-primary)]">67%</span>
        </div>
      </div>
    </aside>
  );
}
