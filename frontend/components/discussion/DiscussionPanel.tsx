"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, Award, ShieldAlert, Scale } from "lucide-react";

export default function DiscussionPanel({
  analysisId,
  asset,
  timeframe,
  analysisResult
}: {
  analysisId?: string | null;
  asset?: string;
  timeframe?: string;
  analysisResult?: any;
}) {
  const [activeTab, setActiveTab] = useState<"chat" | "debate">("chat");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Analisis selesai. Setup ini menunjukkan bias BULLISH dengan confidence 74%. Ada yang ingin kamu tanyakan tentang setup ini?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Debate Agent states
  const [bullDebate, setBullDebate] = useState<{ argument: string; confidence: number; key_points: string[] } | null>(null);
  const [bearDebate, setBearDebate] = useState<{ argument: string; confidence: number; key_points: string[] } | null>(null);
  const [debateSummary, setDebateSummary] = useState<{ winner: string; bull_score: number; bear_score: number; debate_summary: string; final_position: string } | null>(null);

  // Initialize from props if analysisResult changes
  useEffect(() => {
    if (analysisResult && analysisResult.sources) {
      if (analysisResult.sources.bull_debate) {
        setBullDebate(analysisResult.sources.bull_debate);
      }
      if (analysisResult.sources.bear_debate) {
        setBearDebate(analysisResult.sources.bear_debate);
      }
      if (analysisResult.sources.debate) {
        setDebateSummary(analysisResult.sources.debate);
      }
    } else {
      // Clear debate state if starting a new analysis
      setBullDebate(null);
      setBearDebate(null);
      setDebateSummary(null);
    }
  }, [analysisResult]);

  // Connect to WS for real-time updates during run and load chat history
  useEffect(() => {
    if (!analysisId) {
      setMessages([
        { role: "ai", text: "Analisis selesai. Setup ini menunjukkan bias BULLISH dengan confidence 74%. Ada yang ingin kamu tanyakan tentang setup ini?" }
      ]);
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    // Fetch chat history from DB
    fetch(`${backendUrl}/api/analysis/${analysisId}/chat`)
      .then(res => res.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([
            { role: "ai", text: "Analisis selesai. Setup ini menunjukkan bias BULLISH dengan confidence 74%. Ada yang ingin kamu tanyakan tentang setup ini?" }
          ]);
        }
      })
      .catch(err => console.error("Error loading chat history:", err));

    const wsUrl = backendUrl.replace("http", "ws") + "/ws/agents";
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.analysis_id === analysisId) {
          if (data.node === "bull" && data.data) {
            setBullDebate(data.data);
          } else if (data.node === "bear" && data.data) {
            setBearDebate(data.data);
          } else if (data.node === "debate_moderator" && data.data) {
            setDebateSummary(data.data);
          }
        }
      } catch (e) {
        console.error("Failed to parse debate ws message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [analysisId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/analysis/${analysisId || "demo"}/discuss`, {
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
    <aside className="w-full h-full bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50">
        <h3 className="font-bold text-[var(--text-primary)] flex items-center">
          <Bot className="w-5 h-5 mr-2 text-[var(--cyan-primary)]" /> Analisis & Diskusi AI
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Konteks: {asset || "BTC/USDT"} {timeframe || "4H"} Analysis
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "chat"
              ? "border-[var(--cyan-primary)] text-[var(--cyan-primary)] bg-[var(--bg-surface)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          AI Chat
        </button>
        <button
          onClick={() => setActiveTab("debate")}
          className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative ${
            activeTab === "debate"
              ? "border-[var(--cyan-primary)] text-[var(--cyan-primary)] bg-[var(--bg-surface)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Agent Debate
          {bullDebate && !debateSummary && (
            <span className="absolute top-2 right-4 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--cyan-primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--cyan-primary)]"></span>
            </span>
          )}
        </button>
      </div>

      {activeTab === "chat" ? (
        <>
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
            <div ref={chatEndRef} />
          </div>

          {/* Preset Questions */}
          <div className="px-4 py-2 border-t border-[var(--border-subtle)] flex overflow-x-auto no-scrollbar space-x-2 bg-[var(--bg-surface)]">
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
        </>
      ) : (
        /* Agent Debate Content */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!bullDebate && !bearDebate && !debateSummary ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[var(--text-secondary)]">
              <Bot className="w-8 h-8 mb-2 animate-pulse text-[var(--cyan-primary)]" />
              <p className="text-sm font-semibold">Menunggu Argumen Agent...</p>
              <p className="text-xs mt-1 leading-relaxed max-w-[200px]">Debat multi-agent akan dimulai secara real-time setelah data market dan analisis risiko selesai.</p>
            </div>
          ) : (
            <>
              {/* Scorecard Slider */}
              {debateSummary && (
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-emerald-400">BULL ({debateSummary.bull_score}%)</span>
                    <span className="text-slate-400"><Scale className="w-4 h-4 inline" /></span>
                    <span className="text-rose-400">BEAR ({debateSummary.bear_score}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${debateSummary.bull_score}%` }} 
                    />
                    <div 
                      className="bg-rose-500 h-full transition-all duration-500" 
                      style={{ width: `${debateSummary.bear_score}%` }} 
                    />
                  </div>
                  <div className="text-center pt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      debateSummary.winner === "BULL" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : debateSummary.winner === "BEAR"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}>
                      WINNER: {debateSummary.winner}
                    </span>
                  </div>
                </div>
              )}

              {/* Bull Agent Argument */}
              {bullDebate && (
                <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center border-b border-emerald-500/10 pb-1.5">
                    <span className="text-xs font-bold text-emerald-400 flex items-center">
                      <Award className="w-3.5 h-3.5 mr-1" /> BULL AGENT
                    </span>
                    <span className="text-[10px] text-emerald-400/70 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Conf: {bullDebate.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed italic">
                    "{bullDebate.argument}"
                  </p>
                  {bullDebate.key_points && bullDebate.key_points.length > 0 && (
                    <ul className="text-[11px] text-[var(--text-secondary)] space-y-1 pl-4 list-disc">
                      {bullDebate.key_points.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Bear Agent Argument */}
              {bearDebate && (
                <div className="bg-rose-950/10 border border-rose-500/20 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center border-b border-rose-500/10 pb-1.5">
                    <span className="text-xs font-bold text-rose-400 flex items-center">
                      <ShieldAlert className="w-3.5 h-3.5 mr-1" /> BEAR AGENT
                    </span>
                    <span className="text-[10px] text-rose-400/70 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded">
                      Conf: {bearDebate.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed italic">
                    "{bearDebate.argument}"
                  </p>
                  {bearDebate.key_points && bearDebate.key_points.length > 0 && (
                    <ul className="text-[11px] text-[var(--text-secondary)] space-y-1 pl-4 list-disc">
                      {bearDebate.key_points.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Debate Summary / Moderator Conclusion */}
              {debateSummary && (
                <div className="bg-slate-900 border border-slate-700/50 rounded-lg p-3 space-y-2">
                  <div className="border-b border-slate-700 pb-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center">
                      ⚖️ DEBATE MODERATOR
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {debateSummary.debate_summary}
                  </p>
                  <div className="text-[11px] text-[var(--text-secondary)] bg-slate-950 p-2 rounded">
                    <strong>Final Consensus Position:</strong> {debateSummary.final_position}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </aside>
  );
}
