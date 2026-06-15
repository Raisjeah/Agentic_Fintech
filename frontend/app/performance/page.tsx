"use client";

import { BarChart, TrendingUp, Award, Clock, ArrowUpRight } from "lucide-react";

export default function PerformancePage() {
  const metrics = [
    { title: "Win Rate", value: "67%", icon: Award, color: "text-emerald-400" },
    { title: "Total Trades Executed", value: "24", icon: BarChart, color: "text-[var(--cyan-primary)]" },
    { title: "Avg. Confidence Level", value: "71%", icon: TrendingUp, color: "text-amber-400" },
    { title: "Avg. Analysis Time", value: "18s", icon: Clock, color: "text-slate-400" },
  ];

  const historicalTrades = [
    { id: 1, asset: "BTC/USDT", timeframe: "4H", bias: "BULLISH", status: "WIN", date: "2026-06-14" },
    { id: 2, asset: "ETH/USDT", timeframe: "1H", bias: "BEARISH", status: "LOSS", date: "2026-06-13" },
    { id: 3, asset: "SOL/USDT", timeframe: "4H", bias: "BULLISH", status: "WIN", date: "2026-06-12" },
    { id: 4, asset: "BTC/USDT", timeframe: "15M", bias: "BULLISH", status: "WIN", date: "2026-06-10" },
  ];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 bg-[var(--bg-primary)]">
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] flex items-center">
            <BarChart className="w-6 h-6 mr-2 text-[var(--cyan-primary)]" /> Trading Performance
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Review model accuracies, historical win rates, and statistics.</p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">{m.title}</p>
                <h3 className={`text-3xl font-display font-bold mt-2 ${m.color}`}>{m.value}</h3>
              </div>
              <div className="p-3 bg-[var(--bg-elevated)] rounded-md border border-[var(--border-default)]">
                <Icon className="w-6 h-6 text-[var(--text-secondary)]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Summary Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-6 space-y-4">
        <h2 className="text-md font-bold text-[var(--text-primary)] flex items-center">
          <ArrowUpRight className="w-4 h-4 mr-2 text-[var(--cyan-primary)]" /> Recent Backtest / Live Outcomes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)] uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Timeframe</th>
                <th className="py-3 px-4">Bias</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {historicalTrades.map((t) => (
                <tr key={t.id} className="border-b border-[var(--border-subtle)]/50 hover:bg-[var(--bg-elevated)]/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{t.asset}</td>
                  <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">{t.timeframe}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.bias === "BULLISH" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {t.bias}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === "WIN" ? "bg-emerald-500 text-[#070B14]" : "bg-rose-500 text-[#070B14]"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
