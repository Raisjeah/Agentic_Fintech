"use client";

import { useEffect, useState } from "react";
import { BarChart, TrendingUp, Award, Clock, ArrowUpRight, Loader2 } from "lucide-react";

interface PerformanceMetrics {
  total_tracked_trades: number;
  wins: number;
  losses: number;
  win_rate_percent: number;
}

interface HistoricalTrade {
  _id?: string;
  asset: string;
  timeframe: string;
  bias?: string;
  outcome?: string;
  created_at?: string;
}

export default function PerformancePage() {
  const [metricsData, setMetricsData] = useState<PerformanceMetrics | null>(null);
  const [historicalTrades, setHistoricalTrades] = useState<HistoricalTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const [perfRes, histRes] = await Promise.all([
          fetch(`${backendUrl}/api/performance`),
          fetch(`${backendUrl}/api/history`)
        ]);

        if (perfRes.ok) {
          setMetricsData(await perfRes.json());
        }
        if (histRes.ok) {
          setHistoricalTrades(await histRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch performance data", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const metrics = [
    { title: "Win Rate", value: metricsData ? `${metricsData.win_rate_percent}%` : "--", icon: Award, color: "text-emerald-400" },
    { title: "Total Trades Executed", value: metricsData ? metricsData.total_tracked_trades.toString() : "--", icon: BarChart, color: "text-[var(--cyan-primary)]" },
    { title: "Wins / Losses", value: metricsData ? `${metricsData.wins} / ${metricsData.losses}` : "--", icon: TrendingUp, color: "text-amber-400" },
    { title: "Avg. Analysis Time", value: "18s", icon: Clock, color: "text-slate-400" },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full bg-[var(--bg-primary)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--cyan-primary)]" />
      </div>
    );
  }

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
              {historicalTrades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[var(--text-muted)]">No historical trades found</td>
                </tr>
              ) : (
                historicalTrades.map((t, index) => {
                  const bias = t.bias || "NEUTRAL";
                  const status = t.outcome || "PENDING";
                  const date = t.created_at ? new Date(t.created_at).toLocaleDateString() : "--";
                  
                  return (
                    <tr key={t._id || index} className="border-b border-[var(--border-subtle)]/50 hover:bg-[var(--bg-elevated)]/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{t.asset}</td>
                      <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">{t.timeframe}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bias === "BULLISH" ? "bg-emerald-500/10 text-emerald-400" : bias === "BEARISH" ? "bg-rose-500/10 text-rose-400" : "bg-slate-500/10 text-slate-400"
                        }`}>
                          {bias}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          status === "WIN" ? "bg-emerald-500 text-[#070B14]" : status === "LOSS" ? "bg-rose-500 text-[#070B14]" : "bg-amber-500 text-[#070B14]"
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">{date}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
