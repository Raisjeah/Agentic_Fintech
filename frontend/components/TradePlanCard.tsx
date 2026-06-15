"use client";
import { useState } from "react";

export default function TradePlanCard({ plan, asset, timeframe, id }: { plan: any, asset: string, timeframe: string, id: string }) {
  const isBullish = plan.overall_bias === "BULLISH";
  const isBearish = plan.overall_bias === "BEARISH";
  const badgeColor = isBullish ? "bg-[#00D4AA]/20 text-[#00D4AA] border-[#00D4AA]/30" : isBearish ? "bg-[#FF4757]/20 text-[#FF4757] border-[#FF4757]/30" : "bg-[#FFA502]/20 text-[#FFA502] border-[#FFA502]/30";

  const [status, setStatus] = useState<string | null>(null);

  const handleAction = async (action: "approve" | "reject") => {
    try {
      const res = await fetch(`http://localhost:8000/api/analysis/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: action === "reject" ? "Rejected by user" : "" })
      });
      if (res.ok) setStatus(action);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-lg shadow-2xl overflow-hidden font-sans relative">
      {plan.sources?.risk?.risk_score > 80 && (
        <div className="bg-[#FF4757] text-[#0A0E1A] text-center text-sm font-bold py-2 uppercase tracking-widest animate-pulse">
          EXTREME RISK DETECTED — VETO RECOMMENDED
        </div>
      )}
      <div className="border-b border-[#1F2937] p-6 flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl font-bold font-mono">{asset}</h2>
            <span className="text-[#6B7280] font-mono">{timeframe}</span>
            <span className={`px-2 py-1 text-xs font-bold rounded border ${badgeColor}`}>
              {plan.overall_bias}
            </span>
          </div>
          <p className="text-[#E5E7EB] text-sm">{plan.reasoning}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-[#6B7280]">Confidence</div>
          <div className="text-xl font-bold text-[#E5E7EB]">{plan.confidence}%</div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0A0E1A] border border-[#1F2937] p-4 rounded">
          <h3 className="text-[#6B7280] text-xs font-bold uppercase tracking-wider mb-4 border-b border-[#1F2937] pb-2">Entry Plan</h3>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-[#E5E7EB]">Entry Zone</span>
              <span className="text-[#00D4AA]">${plan.entry_plan.zone_low} - ${plan.entry_plan.zone_high}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#E5E7EB]">Stop Loss</span>
              <span className="text-[#FF4757]">${plan.stop_loss}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#1F2937]/50">
              <span className="text-[#E5E7EB]">R:R Ratio</span>
              <span>1 : {plan.rr_ratio}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0E1A] border border-[#1F2937] p-4 rounded">
          <h3 className="text-[#6B7280] text-xs font-bold uppercase tracking-wider mb-4 border-b border-[#1F2937] pb-2">Take Profit Targets</h3>
          <div className="space-y-3 font-mono text-sm">
            {plan.take_profit.map((tp: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span className="text-[#E5E7EB]">TP {tp.level} ({tp.size_percent}%)</span>
                <span className="text-[#00D4AA]">${tp.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-[#1F2937] grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-[#6B7280] text-xs font-bold uppercase tracking-wider mb-4">Risk Flags</h3>
          <ul className="space-y-2 text-sm">
            {plan.risk_flags.length > 0 ? (
              plan.risk_flags.map((flag: string, idx: number) => (
                <li key={idx} className="flex items-start text-[#FFA502]">
                  <span className="mr-2">⚠️</span> {flag}
                </li>
              ))
            ) : (
              <li className="text-[#6B7280]">No major risk flags detected.</li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-[#6B7280] text-xs font-bold uppercase tracking-wider mb-4">Money Management</h3>
          <div className="bg-[#0A0E1A] border border-[#1F2937] p-3 rounded text-sm space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Risk Amount:</span>
              <span className="text-[#E5E7EB]">${plan.money_management?.risk_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Position Size:</span>
              <span className="text-[#E5E7EB]">{plan.money_management?.position_size?.toFixed(4)} Units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Max Loss:</span>
              <span className="text-[#FF4757]">${plan.money_management?.max_loss?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0A0E1A] p-4 flex justify-end space-x-4 border-t border-[#1F2937]">
        {status ? (
          <span className={`px-6 py-2 font-bold rounded text-sm ${status === "approve" ? "text-[#00D4AA]" : "text-[#FF4757]"}`}>
            {status === "approve" ? "✓ Approved" : "✗ Rejected"}
          </span>
        ) : (
          <>
            <button onClick={() => handleAction("reject")} className="px-6 py-2 border border-[#FF4757] text-[#FF4757] hover:bg-[#FF4757]/10 font-bold rounded transition-colors text-sm">
              Reject
            </button>
            <button onClick={() => handleAction("approve")} className="px-6 py-2 bg-[#00D4AA] text-[#0A0E1A] hover:bg-[#00b390] font-bold rounded transition-colors text-sm">
              Approve Plan
            </button>
          </>
        )}
      </div>
    </div>
  );
}
