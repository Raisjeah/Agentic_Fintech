"use client";

import { useState } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

export default function DiscussionPanel({ analysisId }: { analysisId?: string | null }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Analisis selesai. Setup ini menunjukkan bias BULLISH dengan confidence 74%. Ada yang ingin kamu tanyakan tentang setup ini?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const presetQuestions = [
    "Kenapa entry di sini?",
    "Bagaimana kalau CPI naik?",
    "Kapan invalidate setup ini?",
    "Berapa probability profit?"
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setIsLoading(true);

    try {
      // Connect to the new backend endpoint
      const res = await fetch("http://localhost:8000/api/analysis/123/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Maaf, terjadi kesalahan saat menyambung ke server AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <h3 className="font-bold text-[var(--text-primary)] flex items-center">
          <Bot className="w-5 h-5 mr-2 text-[var(--cyan-primary)]" /> Diskusi dengan AI
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Konteks: BTC/USDT 4H Analysis</p>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
              msg.role === "user" 
                ? "bg-[var(--cyan-dim)] text-[var(--text-primary)] border border-[var(--cyan-primary)]/30 rounded-br-none" 
                : "bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-bl-none"
            }`}>
              <div className="flex items-center mb-1 space-x-1 opacity-70">
                {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                <span className="text-[10px] uppercase font-bold tracking-wider">{msg.role === "user" ? "Kamu" : "AI Research Desk"}</span>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg rounded-bl-none p-3 flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-[var(--cyan-primary)] animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-[var(--cyan-primary)] animate-pulse" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-[var(--cyan-primary)] animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Preset Questions */}
      <div className="px-4 py-2 border-t border-[var(--border-subtle)] flex overflow-x-auto no-scrollbar space-x-2">
        {presetQuestions.map((q, idx) => (
          <button 
            key={idx} 
            onClick={() => handleSend(q)}
            className="whitespace-nowrap px-3 py-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] border border-[var(--border-default)] hover:border-[var(--cyan-primary)] transition-colors rounded-full text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Tanya tentang analisis ini..."
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-md py-2 pl-3 pr-10 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-primary)] transition-colors"
          />
          <button 
            onClick={() => handleSend(input)}
            className="absolute right-2 text-[var(--cyan-primary)] hover:opacity-80 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
