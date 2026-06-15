"use client";

import { useState } from "react";
import AnalysisForm from "@/components/analysis/AnalysisForm";
import ChartPanel from "@/components/chart/ChartPanel";
import TradePlanCard from "@/components/analysis/TradePlanCard";
import SourcePanel from "@/components/analysis/SourcePanel";
import DiscussionPanel from "@/components/discussion/DiscussionPanel";

export default function DashboardPage() {
  const [asset, setAsset] = useState("BTC/USDT");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");

  const handleTriggerAnalysis = async (goal: string, capital: string, risk: number) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setProgress("Initializing...");
    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset, timeframe: "4H", goal, capital: parseFloat(capital), risk_percent: risk })
      });
      const data = await res.json();
      const id = data.id;
      setAnalysisId(id);

      // Poll until complete
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`http://localhost:8000/api/analysis/${id}`);
          const statusData = await statusRes.json();
          if (statusData.status === "completed") {
            setAnalysisResult(statusData.report);
            setIsAnalyzing(false);
            clearInterval(interval);
          } else if (statusData.status === "failed") {
            setIsAnalyzing(false);
            clearInterval(interval);
            alert("Analysis failed. Please try again.");
          } else {
            setProgress(statusData.status);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      alert("Failed to connect to backend");
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar pb-10">
        <AnalysisForm asset={asset} onTrigger={handleTriggerAnalysis} isAnalyzing={isAnalyzing} progress={progress} />
        <div className="min-h-[500px]">
          <ChartPanel asset={asset} />
        </div>
        {analysisResult && (
          <>
            <TradePlanCard data={analysisResult} asset={asset} />
            <SourcePanel data={analysisResult.sources} />
          </>
        )}
        {isAnalyzing && (
          <div className="p-8 text-center text-[var(--cyan-primary)] font-mono animate-pulse">
            Analysis Graph is running: {progress.toUpperCase()}... Please wait.
          </div>
        )}
      </div>

      {/* Agent/Discussion Panel Right Sidebar */}
      <div className="hidden lg:flex">
        <DiscussionPanel analysisId={analysisId} />
      </div>
    </div>
  );
}
