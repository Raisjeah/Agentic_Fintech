"use client";

import { useState } from "react";
import { Search, BellRing, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([
    { id: 1, asset: "BTC/USDT", category: "crypto", price: "65,234.50", change: 2.3, alertLevel: "67,000", alertDirection: "above" },
    { id: 2, asset: "ETH/USDT", category: "crypto", price: "3,450.20", change: 1.5, alertLevel: "3,000", alertDirection: "below" },
    { id: 3, asset: "EUR/USD", category: "forex", price: "1.0845", change: -0.2, alertLevel: "1.0900", alertDirection: "above" },
    { id: 4, asset: "XAUUSD", category: "komoditas", price: "2,340.50", change: 0.8, alertLevel: null, alertDirection: null },
  ]);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Watchlist & Alerts</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Monitor passive assets and manage Telegram price alerts.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Add to watchlist..."
              className="w-64 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-md py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-primary)]"
            />
          </div>
          <button className="bg-[var(--cyan-primary)] text-[#070B14] font-bold px-4 py-2 rounded-md text-sm">
            + Add Asset
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {watchlist.map((item) => (
          <div key={item.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 flex flex-col hover:border-[var(--border-default)] transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">{item.asset}</h3>
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded">{item.category}</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-[var(--text-primary)]">{item.price}</div>
                <div className={`font-mono text-sm flex items-center justify-end ${item.change >= 0 ? "text-[var(--cyan-primary)]" : "text-[var(--red-danger)]"}`}>
                  {item.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {item.change >= 0 ? "+" : ""}{item.change}%
                </div>
              </div>
            </div>

            {/* Sparkline Placeholder */}
            <div className="h-16 w-full bg-[var(--bg-input)] rounded flex items-center justify-center mb-4 border border-[var(--border-default)]">
               <span className="text-[var(--text-muted)] text-xs">Mini Chart</span>
            </div>

            {/* Alert Status */}
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <BellRing className={`w-4 h-4 ${item.alertLevel ? "text-[var(--orange-warn)]" : "text-[var(--text-muted)]"}`} />
                {item.alertLevel ? (
                  <span className="text-[var(--text-secondary)]">
                    Alert <span className="font-mono text-[var(--text-primary)]">{item.alertDirection === "above" ? "≥" : "≤"} {item.alertLevel}</span>
                  </span>
                ) : (
                  <span className="text-[var(--text-muted)] italic">No alert set</span>
                )}
              </div>
              <button className="text-xs text-[var(--cyan-primary)] hover:underline">Edit</button>
            </div>

            {/* Analyze Now Button */}
            <Link href={`/dashboard?asset=${encodeURIComponent(item.asset)}`} className="w-full text-center py-2 bg-[var(--cyan-dim)] text-[var(--cyan-primary)] rounded-md text-sm font-bold border border-[var(--cyan-primary)]/30 hover:bg-[var(--cyan-primary)] hover:text-[#070B14] transition-colors flex items-center justify-center">
              <ExternalLink className="w-4 h-4 mr-2" />
              Analyze Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
