"use client";

import { useState, useEffect } from "react";
import { BarChart2, Filter, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Mock data for UI demonstration to match the requested design
      setPerformance({
        total: 24,
        win_rate: 67,
        avg_conf: 71,
        approved: 18,
        rejected: 6
      });
      
      setHistory([
        {
          id: "1",
          asset: "BTC/USDT",
          timeframe: "4H",
          goal: "SWING",
          created_at: "2026-06-15T14:32:00Z",
          bias: "BULLISH",
          confidence: 74,
          approval: "Approved",
          entry: "$65k",
          tp: "$70k",
          sl: "$63k",
          rr: "1:2.5",
          outcome: "Pending"
        },
        {
          id: "2",
          asset: "EUR/USD",
          timeframe: "1H",
          goal: "DAY",
          created_at: "2026-06-14T09:15:00Z",
          bias: "BEARISH",
          confidence: 82,
          approval: "Approved",
          entry: "1.0850",
          tp: "1.0750",
          sl: "1.0900",
          rr: "1:2.0",
          outcome: "WIN"
        },
        {
          id: "3",
          asset: "ETH/USDT",
          timeframe: "15M",
          goal: "SCALP",
          created_at: "2026-06-14T08:00:00Z",
          bias: "BULLISH",
          confidence: 65,
          approval: "Rejected",
          entry: "$3,400",
          tp: "$3,450",
          sl: "$3,350",
          rr: "1:1",
          outcome: "N/A"
        }
      ]);
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
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Total Analyses</div>
          <div className="text-2xl font-mono text-[var(--text-primary)]">{performance?.total || 0}</div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Win Rate (30d)</div>
          <div className="text-2xl font-mono text-[var(--cyan-primary)]">{performance?.win_rate || 0}%</div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Avg Confidence</div>
          <div className="text-2xl font-mono text-[var(--text-primary)]">{performance?.avg_conf || 0}%</div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Approved</div>
          <div className="text-2xl font-mono text-[var(--cyan-primary)]">{performance?.approved || 0}</div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Rejected</div>
          <div className="text-2xl font-mono text-[var(--red-danger)]">{performance?.rejected || 0}</div>
        </div>
      </div>

      {/* SECTION 2 - Chart Placeholder */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] h-48 rounded-lg flex items-center justify-center flex-col">
        <BarChart2 className="w-8 h-8 text-[var(--text-muted)] mb-2" />
        <span className="text-[var(--text-muted)] text-sm">Performance Chart Visualization (WIP)</span>
      </div>

      {/* SECTION 3 - Filter Bar */}
      <div className="flex items-center space-x-6 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          <span className="text-[var(--text-secondary)]">Filters:</span>
        </div>
        <div className="flex space-x-2">
           <button className="px-3 py-1 text-sm bg-[var(--bg-elevated)] border border-[var(--cyan-primary)] text-[var(--cyan-primary)] rounded-full">All Assets</button>
           <button className="px-3 py-1 text-sm bg-[var(--bg-input)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-full">Crypto</button>
           <button className="px-3 py-1 text-sm bg-[var(--bg-input)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-full">Forex</button>
        </div>
        <div className="w-px h-6 bg-[var(--border-default)]"></div>
        <div className="flex space-x-2">
           <button className="px-3 py-1 text-sm bg-[var(--bg-elevated)] border border-[var(--cyan-primary)] text-[var(--cyan-primary)] rounded-full">All Status</button>
           <button className="px-3 py-1 text-sm bg-[var(--bg-input)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-full">Approved</button>
           <button className="px-3 py-1 text-sm bg-[var(--bg-input)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-full">Rejected</button>
        </div>
      </div>

      {/* SECTION 4 - History Cards */}
      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 flex flex-col space-y-3 hover:border-[var(--border-default)] transition-colors">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center space-x-4">
                <span className="font-display font-bold text-lg">{item.asset}</span>
                <span className="text-xs bg-[var(--bg-elevated)] px-2 py-1 rounded text-[var(--text-secondary)]">{item.timeframe}</span>
                <span className="text-xs bg-[var(--bg-elevated)] px-2 py-1 rounded text-[var(--text-secondary)]">{item.goal}</span>
              </div>
              <div className="text-sm font-mono text-[var(--text-secondary)]">
                {new Date(item.created_at).toLocaleString()}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  {item.bias === "BULLISH" ? <span className="text-[var(--cyan-primary)] font-bold">🟢 BULLISH</span> : <span className="text-[var(--red-danger)] font-bold">🔴 BEARISH</span>}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">Confidence: <span className="font-mono text-[var(--text-primary)]">{item.confidence}%</span></div>
                <div className="text-sm flex items-center space-x-1">
                  {item.approval === "Approved" ? <CheckCircle2 className="w-4 h-4 text-[var(--cyan-primary)]" /> : <XCircle className="w-4 h-4 text-[var(--red-danger)]" />}
                  <span className={item.approval === "Approved" ? "text-[var(--cyan-primary)]" : "text-[var(--red-danger)]"}>{item.approval}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-[var(--bg-elevated)] p-3 rounded font-mono text-sm">
              <div><span className="text-[var(--text-muted)] block text-xs">Entry</span> {item.entry}</div>
              <div><span className="text-[var(--text-muted)] block text-xs">TP</span> <span className="text-[var(--cyan-primary)]">{item.tp}</span></div>
              <div><span className="text-[var(--text-muted)] block text-xs">SL</span> <span className="text-[var(--red-danger)]">{item.sl}</span></div>
              <div><span className="text-[var(--text-muted)] block text-xs">RR</span> {item.rr}</div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[var(--text-secondary)]">Outcome:</span>
                {item.outcome === "Pending" ? (
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-[var(--cyan-dim)] text-[var(--cyan-primary)] border border-[var(--cyan-primary)]/50 hover:bg-[var(--cyan-primary)] hover:text-[#070B14] rounded text-xs transition-colors">✓ Mark as WIN</button>
                    <button className="px-3 py-1 bg-[var(--red-dim)] text-[var(--red-danger)] border border-[var(--red-danger)]/50 hover:bg-[var(--red-danger)] hover:text-[#070B14] rounded text-xs transition-colors">✗ Mark as LOSS</button>
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
