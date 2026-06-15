"use client";

import { useState } from "react";
import { Zap } from "lucide-react";

export default function AnalysisForm({ asset = "BTC/USDT", onTrigger, isAnalyzing, progress }: any) {
  const [goal, setGoal] = useState("Swing Trade");
  const [capital, setCapital] = useState("1000");
  const [risk, setRisk] = useState(1);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg mx-4 mt-4 mb-4 p-4 flex items-center space-x-6">
      {/* Asset Display */}
      <div className="flex flex-col border-r border-[var(--border-subtle)] pr-6">
        <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Target Asset</span>
        <span className="font-display font-bold text-xl text-[var(--text-primary)] tracking-tight">{asset}</span>
      </div>

      {/* Goal Selector */}
      <div className="flex flex-col">
        <span className="text-xs text-[var(--text-secondary)] mb-1">Goal</span>
        <select 
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-primary)]"
        >
          <option>Scalping</option>
          <option>Day Trade</option>
          <option>Swing Trade</option>
          <option>Position</option>
        </select>
      </div>

      {/* Capital Input */}
      <div className="flex flex-col">
        <span className="text-xs text-[var(--text-secondary)] mb-1">Capital (USD)</span>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
          <input 
            type="number" 
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            className="w-32 bg-[var(--bg-input)] border border-[var(--border-default)] rounded px-3 py-1.5 pl-7 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-primary)]"
          />
        </div>
      </div>

      {/* Risk Slider */}
      <div className="flex flex-col flex-1 max-w-[200px]">
        <div className="flex justify-between items-end mb-1">
          <span className="text-xs text-[var(--text-secondary)]">Risk per Trade</span>
          <span className="text-sm font-mono text-[var(--cyan-primary)]">{risk}%</span>
        </div>
        <input 
          type="range" 
          min="0.5" max="3" step="0.5" 
          value={risk}
          onChange={(e) => setRisk(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-[var(--border-default)] rounded-lg appearance-none cursor-pointer accent-[var(--cyan-primary)]"
        />
      </div>

      {/* Trigger Button */}
      <div className="flex-1 flex justify-end">
        <button 
          onClick={() => onTrigger && onTrigger(goal, capital, risk)}
          disabled={isAnalyzing}
          className={`font-bold px-6 py-2 rounded-md flex items-center transition-opacity ${
            isAnalyzing 
              ? "bg-[var(--bg-input)] text-[var(--text-secondary)] cursor-not-allowed" 
              : "bg-[var(--cyan-primary)] hover:opacity-90 text-[#070B14] shadow-[0_0_15px_rgba(0,212,170,0.3)] hover:shadow-[0_0_25px_rgba(0,212,170,0.5)]"
          }`}
        >
          <Zap className="w-4 h-4 mr-2" />
          {isAnalyzing ? `ANALYZING...` : "TRIGGER ANALYSIS"}
        </button>
      </div>
    </div>
  );
}
