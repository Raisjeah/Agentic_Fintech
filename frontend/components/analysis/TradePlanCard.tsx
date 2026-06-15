import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

export default function TradePlanCard({ data, asset }: { data?: any, asset?: string }) {
  if (!data) return null;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg mx-4 mb-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-[var(--bg-elevated)] p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center space-x-4">
          <span className="font-display font-bold text-xl text-[var(--text-primary)] tracking-tight">{asset} 4H</span>
          <div className={`px-3 py-1 rounded text-sm font-bold tracking-widest ${data.overall_bias === 'BULLISH' ? 'bg-[var(--cyan-dim)] text-[var(--cyan-primary)]' : data.overall_bias === 'BEARISH' ? 'bg-[var(--red-dim)] text-[var(--red-danger)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)]'}`}>
            {data.overall_bias} {data.overall_bias === 'BULLISH' ? '🟢' : data.overall_bias === 'BEARISH' ? '🔴' : '⚪'}
          </div>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-[var(--text-secondary)]">Confidence:</span>
            <div className="flex h-2 w-24 bg-[var(--bg-input)] rounded overflow-hidden">
              <div className={`h-full ${data.confidence > 60 ? 'bg-[var(--cyan-primary)]' : 'bg-[var(--orange-warn)]'}`} style={{ width: `${data.confidence}%` }}></div>
            </div>
            <span className="font-mono font-medium text-[var(--text-primary)]">{data.confidence}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[var(--text-secondary)]">Signal:</span>
            <span className={`font-medium ${data.signal_strength === 'STRONG' ? 'text-[var(--cyan-primary)]' : 'text-[var(--orange-warn)]'}`}>{data.signal_strength}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row border-b border-[var(--border-subtle)]">
        {/* KIRI - Trade Info */}
        <div className="flex-1 p-6 border-r border-[var(--border-subtle)] space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2 text-[var(--cyan-primary)]">
              <CheckCircle2 className="w-4 h-4" />
              <h3 className="font-bold text-sm tracking-wider uppercase">Thesis</h3>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap">
              {data.thesis || data.reasoning || "Data thesis tidak tersedia."}
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2 text-[var(--red-danger)]">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="font-bold text-sm tracking-wider uppercase">Counter Thesis</h3>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap">
              {data.counter_thesis || (data.risk_flags ? data.risk_flags.join(", ") : "Tidak ada counter thesis yang terdeteksi.")}
            </p>
          </div>
        </div>

        {/* KANAN - Trade Numbers */}
        <div className="flex-1 p-6 grid grid-cols-2 gap-y-6 gap-x-4">
          <div>
            <div className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-widest">Entry Zone</div>
            <div className="font-mono text-lg font-bold text-[var(--text-primary)]">
              {data.entry_plan?.zone_low} — {data.entry_plan?.zone_high}
            </div>
          </div>
          
          <div className="space-y-4">
             <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-widest">Position Size</div>
                <div className="font-mono text-[var(--text-primary)]">{data.money_management?.position_size} Units</div>
             </div>
          </div>

          <div>
            <div className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-widest">Stop Loss</div>
            <div className="font-mono text-lg font-bold text-[var(--red-danger)]">{data.stop_loss}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1 font-mono">Risk: ${data.money_management?.risk_amount}</div>
          </div>

          <div>
            <div className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-widest">Take Profit</div>
            <div className="space-y-1">
              {data.take_profit?.map((tp: any, idx: number) => (
                <div key={idx} className="flex justify-between font-mono text-sm">
                  <span className="text-[var(--cyan-primary)]">TP{idx+1}: {tp.price} ({tp.size_percent}%)</span>
                </div>
              ))}
              <div className="text-[var(--text-muted)] font-mono text-sm">Overall RR: 1:{data.rr_ratio}</div>
            </div>
          </div>
        </div>
      </div>

      {/* BAWAH - Scenarios */}
      <div className="bg-[var(--bg-elevated)] p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {['bull', 'base', 'bear'].map((type) => {
          const scenario = data.scenarios?.[type];
          const isObj = typeof scenario === 'object' && scenario !== null;
          
          const borderColors: Record<string, string> = {
            bull: 'border-[var(--cyan-primary)]/30',
            base: 'border-[var(--orange-warn)]/30',
            bear: 'border-[var(--red-danger)]/30'
          };
          const textColors: Record<string, string> = {
            bull: 'text-[var(--cyan-primary)]',
            base: 'text-[var(--orange-warn)]',
            bear: 'text-[var(--red-danger)]'
          };
          const icons: Record<string, string> = { bull: '🟢', base: '🟡', bear: '🔴' };
          const defaultTexts: Record<string, string> = {
            bull: "Menembus resistensi utama.",
            base: "Sideway di area konsolidasi.",
            bear: "Gagal bertahan di zona entry."
          };
          
          return (
            <div key={type} className={`bg-[var(--bg-surface)] border ${borderColors[type]} rounded p-3`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-bold ${textColors[type]}`}>
                  {icons[type]} {type.toUpperCase()} SCENARIO
                </span>
                <span className="font-mono text-xs">{isObj && scenario.probability ? `${scenario.probability}%` : ''}</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap">
                {isObj ? (
                  <div className="space-y-1">
                    {scenario.trigger && <div><span className="opacity-70 font-bold">Trigger:</span> {scenario.trigger}</div>}
                    {scenario.entry && <div><span className="opacity-70 font-bold">Entry:</span> {scenario.entry}</div>}
                    {scenario.tp1 && <div><span className="opacity-70 font-bold">TP1:</span> {scenario.tp1}</div>}
                    {scenario.tp2 && <div><span className="opacity-70 font-bold">TP2:</span> {scenario.tp2}</div>}
                  </div>
                ) : (
                  scenario || defaultTexts[type]
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
