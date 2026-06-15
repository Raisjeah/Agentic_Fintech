"use client";

import { useState } from "react";
import TradePlanCard from "../../components/TradePlanCard";
import AgentStatusCard from "../../components/AgentStatusCard";

export default function DashboardPage() {
  const [asset, setAsset] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("4H");
  const [goal, setGoal] = useState("swing_trade");
  const [capital, setCapital] = useState(1000);
  const [riskPercent, setRiskPercent] = useState(1.0);
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAnalysis(null);
    setCurrentId(null);

    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset,
          timeframe,
          goal,
          capital,
          risk_percent: riskPercent,
        }),
      });
      
      if (!res.ok) throw new Error("Failed to trigger analysis");
      
      const data = await res.json();
      const analysisId = data.id;
      setCurrentId(analysisId);

      // Poll for completion (MVP approach)
      const poll = setInterval(async () => {
        const statusRes = await fetch(`http://localhost:8000/api/analysis/${analysisId}`);
        const statusData = await statusRes.json();
        
        if (statusData.status === "completed") {
          clearInterval(poll);
          setAnalysis({ ...statusData.report, id: statusData.id });
          setLoading(false);
        } else if (statusData.status === "failed") {
          clearInterval(poll);
          setError("Analysis failed on backend.");
          setLoading(false);
        }
      }, 2000);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-[#E5E7EB] font-sans p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight"><span className="text-[#00D4AA]">Brain</span> | Agentic Research Desk</h1>
          <p className="text-[#6B7280]">AI yang berpikir, Manusia yang memutuskan.</p>
        </div>
        <a href="/history" className="text-[#00D4AA] hover:underline font-mono text-sm">
          View History & Performance →
        </a>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#111827] p-6 rounded-lg border border-[#1F2937] shadow-xl">
          <h2 className="text-xl font-bold mb-4 font-mono">New Analysis</h2>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm text-[#6B7280] mb-1">Asset</label>
              <input type="text" value={asset} onChange={(e) => setAsset(e.target.value)} className="w-full bg-[#0A0E1A] border border-[#1F2937] rounded p-2 text-white focus:outline-none focus:border-[#00D4AA]" />
            </div>
            <div>
              <label className="block text-sm text-[#6B7280] mb-1">Timeframe</label>
              <input type="text" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full bg-[#0A0E1A] border border-[#1F2937] rounded p-2 text-white focus:outline-none focus:border-[#00D4AA]" />
            </div>
            <div>
              <label className="block text-sm text-[#6B7280] mb-1">Goal</label>
              <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-[#0A0E1A] border border-[#1F2937] rounded p-2 text-white focus:outline-none focus:border-[#00D4AA]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Capital ($)</label>
                <input type="number" value={capital} onChange={(e) => setCapital(Number(e.target.value))} className="w-full bg-[#0A0E1A] border border-[#1F2937] rounded p-2 text-white focus:outline-none focus:border-[#00D4AA]" />
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Risk (%)</label>
                <input type="number" step="0.1" value={riskPercent} onChange={(e) => setRiskPercent(Number(e.target.value))} className="w-full bg-[#0A0E1A] border border-[#1F2937] rounded p-2 text-white focus:outline-none focus:border-[#00D4AA]" />
              </div>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-[#00D4AA] hover:bg-[#00b390] text-[#0A0E1A] font-bold py-2 rounded transition-all">
              {loading ? "Agent is Thinking..." : "Trigger Analysis"}
            </button>
          </form>
          {error && <div className="mt-4 text-[#FF4757] text-sm">{error}</div>}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading && currentId && (
            <AgentStatusCard analysisId={currentId} />
          )}
          
          {analysis && <TradePlanCard plan={analysis} asset={asset} timeframe={timeframe} id={analysis.id || analysis._id} />}
          
          {!analysis && !loading && (
            <div className="bg-[#111827] p-12 rounded-lg border border-[#1F2937] text-center text-[#6B7280] flex flex-col items-center justify-center h-full">
              <svg className="w-12 h-12 mb-4 text-[#1F2937]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              <p>Trigger an analysis to view the trade plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
