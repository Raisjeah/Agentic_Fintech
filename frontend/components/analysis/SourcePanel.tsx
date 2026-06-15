"use client";

import { useState } from "react";
import { BarChart3, Newspaper, Smile, Globe, LineChart, ExternalLink } from "lucide-react";

type Tab = "market" | "news" | "sentiment" | "macro" | "technical";

export default function SourcePanel({ data }: { data?: any }) {
  const [activeTab, setActiveTab] = useState<Tab>("technical");

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg mx-4 mb-4 flex flex-col overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 pt-2">
        <button 
          onClick={() => setActiveTab("market")}
          className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${activeTab === "market" ? "border-[var(--cyan-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
        >
          <BarChart3 className="w-4 h-4" /> <span>Market Data</span>
        </button>
        <button 
          onClick={() => setActiveTab("news")}
          className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${activeTab === "news" ? "border-[var(--cyan-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
        >
          <Newspaper className="w-4 h-4" /> <span>News</span>
        </button>
        <button 
          onClick={() => setActiveTab("sentiment")}
          className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${activeTab === "sentiment" ? "border-[var(--cyan-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
        >
          <Smile className="w-4 h-4" /> <span>Sentiment</span>
        </button>
        <button 
          onClick={() => setActiveTab("macro")}
          className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${activeTab === "macro" ? "border-[var(--cyan-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
        >
          <Globe className="w-4 h-4" /> <span>Macro</span>
        </button>
        <button 
          onClick={() => setActiveTab("technical")}
          className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${activeTab === "technical" ? "border-[var(--cyan-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
        >
          <LineChart className="w-4 h-4" /> <span>Technical</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-[var(--bg-input)]">
        {/* Market Data Content */}
        {activeTab === "market" && (
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-2 mb-2">
              <span>Source: Backend API</span>
              <span>Fetched: Just now</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-[var(--text-muted)] w-24 inline-block">Price:</span> <span className="text-[var(--text-primary)]">{data?.data?.current_price ? `$${data.data.current_price}` : "N/A"}</span></div>
              <div className="col-span-2 text-xs text-[var(--text-muted)] italic">More market data fetched directly via live websocket...</div>
            </div>
          </div>
        )}

        {/* News Content */}
        {activeTab === "news" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-2 mb-2">
              <span>Source: News Aggregator</span>
              <span>Status: Active</span>
            </div>
            <div className="space-y-3">
              {Array.isArray(data?.news) && data.news.length > 0 ? data.news.slice(0,3).map((item: any, i: number) => (
                 <div key={i} className="flex space-x-3 items-start">
                   <span className="text-[var(--cyan-primary)] mt-1">📰</span>
                   <div>
                     <div className="text-[var(--text-primary)] font-medium text-sm">{item.title}</div>
                     <div className="text-xs text-[var(--text-secondary)] mt-1">{item.source || "Web"}</div>
                   </div>
                 </div>
              )) : (
                 <div className="text-[var(--text-secondary)] text-sm">Tidak ada berita signifikan terbaru.</div>
              )}
            </div>
          </div>
        )}

        {/* Sentiment Content */}
        {activeTab === "sentiment" && (
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-2 mb-2">
              <span>Source: Fear & Greed / Social</span>
              <span>Status: Active</span>
            </div>
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between mb-1 text-[var(--text-primary)]">
                    <span>Index: {data?.sentiment?.fear_greed_index || "N/A"}</span>
                    <span className="text-[var(--cyan-primary)]">{data?.sentiment?.sentiment || "N/A"}</span>
                  </div>
               </div>
               <div>
                  <div className="text-[var(--text-muted)] text-xs mt-2">Analysis:</div>
                  <p className="text-[var(--text-primary)] mt-1 whitespace-pre-wrap text-xs">{data?.sentiment?.analysis || "Tidak ada data sentimen."}</p>
               </div>
            </div>
          </div>
        )}

        {/* Macro Content */}
        {activeTab === "macro" && (
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-2 mb-2">
              <span>Source: Macro API</span>
              <span>Status: Active</span>
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{data?.macro?.summary || "Data makro tidak tersedia."}</p>
            </div>
          </div>
        )}

        {/* Technical Content */}
        {activeTab === "technical" && (
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-2 mb-2">
              <span>Calculated by: Technical Agent</span>
              <span>Status: <span className="text-[var(--cyan-primary)]">Validated</span></span>
            </div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div className="col-span-2">
                <span className="text-[var(--text-muted)] inline-block mb-1">Signals:</span>
                <p className="text-[var(--text-primary)] whitespace-pre-wrap text-xs">{data?.technical?.signals || "No signals."}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[var(--text-muted)] inline-block mb-1">Key Levels:</span>
                <p className="text-[var(--text-primary)] whitespace-pre-wrap text-xs">{data?.technical?.levels || "No levels mapped."}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
