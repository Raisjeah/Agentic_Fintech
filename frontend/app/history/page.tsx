"use client";

import { useState, useEffect } from "react";
import { BarChart2, Filter, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const [perfRes, histRes] = await Promise.all([
        fetch(`${backendUrl}/api/performance`),
        fetch(`${backendUrl}/api/history`)
      ]);

      if (perfRes.ok) {
        const perfData = await perfRes.json();
        setPerformance({
          total: perfData.total_tracked_trades || 0,
          win_rate: perfData.win_rate_percent || 0,
          wins: perfData.wins || 0,
          losses: perfData.losses || 0,
          avg_conf: 71, // Mock metric if not from backend
          approved: perfData.total_tracked_trades || 0, // Fallback placeholder
          rejected: 0 // Fallback placeholder
        });
      }
      
      if (histRes.ok) {
        const histData = await histRes.json();
        // Transform the DB format to UI format if needed
        const formattedHistory = histData.map((item: any) => ({
          id: item.id || item._id,
          asset: item.asset,
          timeframe: item.timeframe,
          goal: item.goal || "SWING",
          created_at: item.created_at || new Date().toISOString(),
          bias: item.report?.overall_bias || "NEUTRAL",
          confidence: item.report?.confidence || 50,
          approval: item.approval_status === "rejected" ? "Rejected" : "Approved",
          entry: item.report?.entry_plan?.zone_low ? `$${item.report.entry_plan.zone_low}` : (typeof item.report?.entry_plan === "string" ? item.report.entry_plan : "N/A"),
          tp: Array.isArray(item.report?.take_profit) ? `$${item.report.take_profit[0]}` : (typeof item.report?.take_profit === "string" ? item.report.take_profit : "N/A"),
          sl: item.report?.stop_loss ? `$${item.report.stop_loss}` : "N/A",
          rr: item.report?.rr_ratio ? `1:${item.report.rr_ratio}` : "N/A",
          outcome: item.outcome || "Pending"
        }));
        setHistory(formattedHistory);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
      {/* SECTION 1 - Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Total Analyses</div>
          <div className="text-2xl font-mono text-[var(--text-primary)]">{performance?.total || 0}</div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Win Rate</div>
          <div className="text-2xl font-mono text-[var(--cyan-primary)]">{performance?.win_rate || 0}%</div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Avg Confidence</div>
          <div className="text-2xl font-mono text-[var(--text-primary)]">{performance?.avg_conf || 0}%</div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Wins</div>
          <div className="text-2xl font-mono text-[var(--cyan-primary)]">{performance?.wins || 0}</div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Losses</div>
          <div className="text-2xl font-mono text-[var(--red-danger)]">{performance?.losses || 0}</div>
        </div>
      </div>

      {/* SECTION 2 - Chart Placeholder */}
      <div className="hidden md:flex bg-[var(--bg-surface)] border border-[var(--border-subtle)] h-48 rounded-lg items-center justify-center flex-col">
        <BarChart2 className="w-8 h-8 text-[var(--text-muted)] mb-2" />
        <span className="text-[var(--text-muted)] text-sm">Performance Chart Visualization (WIP)</span>
      </div>

      {/* SECTION 3 - Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          <span className="text-[var(--text-secondary)]">Filters:</span>
        </div>
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
           <button className="whitespace-nowrap px-3 py-1 text-sm bg-[var(--bg-elevated)] border border-[var(--cyan-primary)] text-[var(--cyan-primary)] rounded-full">All Assets</button>
           <button className="whitespace-nowrap px-3 py-1 text-sm bg-[var(--bg-input)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-full">Crypto</button>
           <button className="whitespace-nowrap px-3 py-1 text-sm bg-[var(--bg-input)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-full">Forex</button>
        </div>
        <div className="hidden md:block w-px h-6 bg-[var(--border-default)]"></div>
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
           <button className="whitespace-nowrap px-3 py-1 text-sm bg-[var(--bg-elevated)] border border-[var(--cyan-primary)] text-[var(--cyan-primary)] rounded-full">All Status</button>
           <button className="whitespace-nowrap px-3 py-1 text-sm bg-[var(--bg-input)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-full">Approved</button>
           <button className="whitespace-nowrap px-3 py-1 text-sm bg-[var(--bg-input)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-full">Rejected</button>
        </div>
      </div>

      {/* SECTION 4 - History Cards */}
      <div className="space-y-4">
        {history.length === 0 && !loading && (
          <div className="text-center py-10 text-[var(--text-muted)]">No history data available.</div>
        )}
        {loading && (
          <div className="text-center py-10 text-[var(--cyan-primary)] animate-pulse">Loading history...</div>
        )}
        {history.map((item) => (
          <div key={item.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 flex flex-col space-y-3 hover:border-[var(--border-default)] transition-colors">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-[var(--border-subtle)] pb-2 space-y-2 md:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="font-display font-bold text-lg">{item.asset}</span>
                <span className="text-xs bg-[var(--bg-elevated)] px-2 py-1 rounded text-[var(--text-secondary)]">{item.timeframe}</span>
                <span className="text-xs bg-[var(--bg-elevated)] px-2 py-1 rounded text-[var(--text-secondary)]">{item.goal}</span>
              </div>
              <div className="text-xs md:text-sm font-mono text-[var(--text-secondary)]">
                {new Date(item.created_at).toLocaleString()}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  {item.bias === "BULLISH" ? <span className="text-[var(--cyan-primary)] font-bold">🟢 BULLISH</span> : item.bias === "BEARISH" ? <span className="text-[var(--red-danger)] font-bold">🔴 BEARISH</span> : <span className="text-[var(--text-secondary)] font-bold">⚪ NEUTRAL</span>}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">Confidence: <span className="font-mono text-[var(--text-primary)]">{item.confidence}%</span></div>
                <div className="text-sm flex items-center space-x-1">
                  {item.approval === "Approved" ? <CheckCircle2 className="w-4 h-4 text-[var(--cyan-primary)]" /> : <XCircle className="w-4 h-4 text-[var(--red-danger)]" />}
                  <span className={item.approval === "Approved" ? "text-[var(--cyan-primary)]" : "text-[var(--red-danger)]"}>{item.approval}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 bg-[var(--bg-elevated)] p-3 rounded font-mono text-sm">
              <div><span className="text-[var(--text-muted)] block text-xs">Entry</span> {item.entry}</div>
              <div><span className="text-[var(--text-muted)] block text-xs">TP</span> <span className="text-[var(--cyan-primary)]">{item.tp}</span></div>
              <div><span className="text-[var(--text-muted)] block text-xs">SL</span> <span className="text-[var(--red-danger)]">{item.sl}</span></div>
              <div><span className="text-[var(--text-muted)] block text-xs">RR</span> {item.rr}</div>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center pt-2 space-y-3 md:space-y-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[var(--text-secondary)]">Outcome:</span>
                {item.outcome === "Pending" ? (
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-[var(--cyan-dim)] text-[var(--cyan-primary)] border border-[var(--cyan-primary)]/50 hover:bg-[var(--cyan-primary)] hover:text-[#070B14] rounded text-xs transition-colors">✓ WIN</button>
                    <button className="px-3 py-1 bg-[var(--red-dim)] text-[var(--red-danger)] border border-[var(--red-danger)]/50 hover:bg-[var(--red-danger)] hover:text-[#070B14] rounded text-xs transition-colors">✗ LOSS</button>
                    <button className="px-3 py-1 bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:text-[var(--text-primary)] rounded text-xs transition-colors">— Skip</button>
                  </div>
                ) : item.outcome === "WIN" ? (
                  <span className="bg-[var(--cyan-primary)] text-[#070B14] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest">WIN ✓</span>
                ) : item.outcome === "LOSS" ? (
                   <span className="bg-[var(--red-danger)] text-[#070B14] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest">LOSS ✗</span>
                ) : (
                  <span className="bg-[var(--bg-input)] text-[var(--text-secondary)] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest">N/A</span>
                )}
              </div>
              <button className="text-[var(--cyan-primary)] hover:underline text-sm flex items-center">
                View Detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
