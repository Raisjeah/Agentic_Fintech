"use client";

import { useState, useEffect } from "react";
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

  // Sync asset state and restore latest analysis on page load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlAsset = params.get("asset");
      if (urlAsset) {
        setAsset(urlAsset);
      }
      
      const id = params.get("analysisId") || localStorage.getItem("latest_analysis_id");
      if (id) {
        setAnalysisId(id);
        fetch(`http://localhost:8000/api/analysis/${id}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.status === "completed") {
              setAnalysisResult(data.report);
            }
          })
          .catch(err => console.error("Error restoring analysis:", err));
      }
    }
  }, []);

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
      localStorage.setItem("latest_analysis_id", id);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, '', `?asset=${encodeURIComponent(asset)}&analysisId=${id}`);
      }

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
    <div className="flex flex-col lg:flex-row h-full w-full overflow-y-auto lg:overflow-hidden bg-[var(--bg-background)]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-auto lg:h-full overflow-y-visible lg:overflow-y-auto no-scrollbar pb-24 lg:pb-10">
        <AnalysisForm asset={asset} onTrigger={handleTriggerAnalysis} isAnalyzing={isAnalyzing} progress={progress} />
        <div className="min-h-[400px] lg:min-h-[500px] flex-1 flex">
          <ChartPanel asset={asset} analysisResult={analysisResult} />
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

      {/* Agent/Discussion Panel (Responsive Sidebar / Bottom Sheet) */}
      <div className="w-full lg:w-80 h-[500px] lg:h-full border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] flex-shrink-0 bg-[var(--bg-surface)]">
        <DiscussionPanel 
          analysisId={analysisId} 
          asset={asset} 
          timeframe="4H" 
          analysisResult={analysisResult} 
        />
      </div>
    </div>
  );
}
