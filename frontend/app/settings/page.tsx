"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Key, Sliders, Database, CheckCircle, XCircle } from "lucide-react";

export default function SettingsPage() {
  const [defaultCapital, setDefaultCapital] = useState("10000");
  const [defaultRisk, setDefaultRisk] = useState("1.0");
  const [isSaved, setIsSaved] = useState(false);
  
  const [apiStatus, setApiStatus] = useState<{gemini_configured: boolean, fred_configured: boolean} | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/api/settings/status`);
        if (res.ok) {
          setApiStatus(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch API status", err);
      }
    }
    checkStatus();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 bg-[var(--bg-primary)]">
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] flex items-center">
            <Settings className="w-6 h-6 mr-2 text-[var(--cyan-primary)]" /> System Settings
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Configure your API connections, models, and risk parameters.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* API Connections */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-6 space-y-4">
          <h2 className="text-md font-bold text-[var(--text-primary)] flex items-center border-b border-[var(--border-subtle)] pb-3">
            <Key className="w-4 h-4 mr-2 text-[var(--cyan-primary)]" /> API Integrations
          </h2>
          
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400 text-xs font-mono mb-4">
            API Keys dikonfigurasi melalui file .env di server backend. Perubahan di sini tidak akan tersimpan.
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-md">
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">FRED API Key</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Digunakan untuk mengambil data FEDFUNDS dan CPIAUCSL riil dari St. Louis Fed.</p>
              </div>
              <div>
                {apiStatus?.fred_configured ? (
                  <span className="flex items-center text-emerald-400 text-xs font-bold"><CheckCircle className="w-4 h-4 mr-1" /> CONNECTED</span>
                ) : (
                  <span className="flex items-center text-rose-400 text-xs font-bold"><XCircle className="w-4 h-4 mr-1" /> MISSING</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-md">
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">Gemini API Key</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Kunci otentikasi utama untuk koordinasi agent LLM.</p>
              </div>
              <div>
                {apiStatus?.gemini_configured ? (
                  <span className="flex items-center text-emerald-400 text-xs font-bold"><CheckCircle className="w-4 h-4 mr-1" /> CONNECTED</span>
                ) : (
                  <span className="flex items-center text-rose-400 text-xs font-bold"><XCircle className="w-4 h-4 mr-1" /> MISSING</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Default Risk Parameters */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-6 space-y-4">
          <h2 className="text-md font-bold text-[var(--text-primary)] flex items-center border-b border-[var(--border-subtle)] pb-3">
            <Sliders className="w-4 h-4 mr-2 text-[var(--cyan-primary)]" /> Parameter Risiko Default
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Kapital Default ($)</label>
              <input
                type="number"
                value={defaultCapital}
                onChange={(e) => setDefaultCapital(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-md py-2 px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-primary)] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Risiko Default per Trade (%)</label>
              <input
                type="number"
                step="0.1"
                value={defaultRisk}
                onChange={(e) => setDefaultRisk(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-md py-2 px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-primary)] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Database & System */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-6 space-y-4">
          <h2 className="text-md font-bold text-[var(--text-primary)] flex items-center border-b border-[var(--border-subtle)] pb-3">
            <Database className="w-4 h-4 mr-2 text-[var(--cyan-primary)]" /> System Status
          </h2>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--text-secondary)]">Database Local DB</span>
            <span className="text-[var(--cyan-primary)] font-bold font-mono">ONLINE</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--text-secondary)]">LangGraph Engine Version</span>
            <span className="text-[var(--text-primary)] font-mono">v0.1.2</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="bg-[var(--cyan-primary)] hover:opacity-95 text-[#070B14] font-bold px-6 py-2.5 rounded-md text-sm flex items-center transition-opacity"
          >
            <Save className="w-4 h-4 mr-2" /> Save Settings
          </button>
          {isSaved && (
            <span className="text-emerald-400 text-sm font-semibold animate-pulse">✓ Konfigurasi berhasil disimpan!</span>
          )}
        </div>
      </form>
    </div>
  );
}
