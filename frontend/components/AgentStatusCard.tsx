"use client";

import { useAgentStatus } from "../hooks/useAgentStatus";

export default function AgentStatusCard({ analysisId }: { analysisId: string }) {
  const messages = useAgentStatus(analysisId);

  return (
    <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-lg shadow-xl font-mono text-sm">
      <h3 className="text-[#00D4AA] font-bold mb-4 flex items-center">
        <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse mr-2"></span>
        Agent Swarm Working...
      </h3>
      
      <div className="space-y-2 h-48 overflow-y-auto pr-2">
        {messages.length === 0 && (
          <div className="text-[#6B7280]">Initializing agents...</div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className="flex space-x-3 text-[#E5E7EB] border-l-2 border-[#1F2937] pl-3 py-1">
            <span className="text-[#6B7280] min-w-[90px]">[Node:{msg.node}]</span>
            <span>{msg.status === "completed" ? "✅ Completed" : "⏳ Running..."}</span>
          </div>
        ))}
        <div className="animate-pulse text-[#6B7280] mt-2">_</div>
      </div>
    </div>
  );
}
