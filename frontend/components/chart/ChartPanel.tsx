"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, ISeriesApi, CandlestickData, CandlestickSeries } from "lightweight-charts";
import { Maximize2, Settings2, BarChart2 } from "lucide-react";

export default function ChartPanel({ 
  asset = "BTC/USDT", 
  analysisResult 
}: { 
  asset?: string; 
  analysisResult?: any;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<any[]>([]);
  const [tf, setTf] = useState("4H");

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8899B4",
      },
      grid: {
        vertLines: { color: "#1A2236" },
        horzLines: { color: "#1A2236" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#1E2D45",
      },
      rightPriceScale: {
        borderColor: "#1E2D45",
      },
      crosshair: {
        mode: 1, // Normal mode
        vertLine: { color: "#4A5568", style: 3 },
        horzLine: { color: "#4A5568", style: 3 },
      },
    });
    
    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00D4AA",
      downColor: "#FF3B5C",
      borderVisible: false,
      wickUpColor: "#00D4AA",
      wickDownColor: "#FF3B5C",
    });
    seriesRef.current = candlestickSeries;

    // Fetch historical data from Binance
    const isCrypto = asset.includes("/");
    const symbol = asset.replace("/", "").toUpperCase();
    const wsSymbol = asset.replace("/", "").toLowerCase();
    
    let ws: WebSocket;

    if (isCrypto) {
      // 1. Fetch real historical candles using selected timeframe (tf)
      const intervalStr = tf.toLowerCase();
      fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${intervalStr}&limit=200`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const historicalData: CandlestickData[] = data.map((candle: any) => ({
              time: (candle[0] / 1000) as any, // Unix timestamp in seconds
              open: parseFloat(candle[1]),
              high: parseFloat(candle[2]),
              low: parseFloat(candle[3]),
              close: parseFloat(candle[4]),
            }));
            candlestickSeries.setData(historicalData);
          }

          // 2. Start WebSocket for live updates after history is loaded
          ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${intervalStr}`);
          ws.onmessage = (event) => {
            try {
              const wsData = JSON.parse(event.data);
              if (wsData && wsData.k) {
                const candle = wsData.k;
                candlestickSeries.update({
                  time: (candle.t / 1000) as any,
                  open: parseFloat(candle.o),
                  high: parseFloat(candle.h),
                  low: parseFloat(candle.l),
                  close: parseFloat(candle.c),
                });
              }
            } catch (err) {}
          };
        })
        .catch(err => console.error("Error fetching historical data", err));
    }

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ws) ws.close();
      chart.remove();
      seriesRef.current = null;
    };
  }, [asset, tf]);

  // Handle price line updates separately
  useEffect(() => {
    if (!seriesRef.current) return;

    // Clear old lines
    priceLinesRef.current.forEach(line => {
      if (seriesRef.current) {
        try {
          seriesRef.current.removePriceLine(line);
        } catch (e) {}
      }
    });
    priceLinesRef.current = [];

    const candlestickSeries = seriesRef.current;

    // Add Overlay Lines
    if (analysisResult) {
      const entryZoneLow = analysisResult.entry_plan?.zone_low;
      const entryZoneHigh = analysisResult.entry_plan?.zone_high;
      const sl = analysisResult.stop_loss;
      const tps = analysisResult.take_profit || [];

      if (entryZoneLow && entryZoneHigh) {
        const entryMid = (entryZoneLow + entryZoneHigh) / 2;
        const entryLine = candlestickSeries.createPriceLine({
          price: entryMid,
          color: "#2563EB",
          lineWidth: 2,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: "Entry Zone (Mid)",
        });
        priceLinesRef.current.push(entryLine);
      }

      if (sl) {
        const slLine = candlestickSeries.createPriceLine({
          price: sl,
          color: "#FF3B5C",
          lineWidth: 2,
          lineStyle: 0, // Solid
          axisLabelVisible: true,
          title: "SL",
        });
        priceLinesRef.current.push(slLine);
      }

      tps.forEach((tp: any) => {
        if (tp.price) {
          const tpLine = candlestickSeries.createPriceLine({
            price: tp.price,
            color: "#00D4AA",
            lineWidth: 2,
            lineStyle: 3, // Dotted
            axisLabelVisible: true,
            title: `TP${tp.level || ""}`,
          });
          priceLinesRef.current.push(tpLine);
        }
      });
    } else {
      // Default / fallback lines before analysis runs
      const basePrice = asset === "ETH/USDT" ? 3400 : 65000;
      const slLine = candlestickSeries.createPriceLine({
        price: basePrice * 0.96,
        color: "#FF3B5C",
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: "SL",
      });
      
      const tpLine = candlestickSeries.createPriceLine({
        price: basePrice * 1.04,
        color: "#00D4AA",
        lineWidth: 2,
        lineStyle: 3,
        axisLabelVisible: true,
        title: "TP1",
      });
      priceLinesRef.current.push(slLine, tpLine);
    }
  }, [analysisResult, asset]);

  return (
    <div className="flex flex-col flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg mx-4 mb-4 overflow-hidden min-h-[300px]">
      {/* Top Bar */}
      <div className="h-12 border-b border-[var(--border-subtle)] flex items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <div className="font-display font-bold text-[var(--text-primary)]">{asset}</div>
          <div className="flex space-x-1">
            {["15M", "1H", "4H", "1D", "1W"].map((t) => (
              <button
                key={t}
                onClick={() => setTf(t)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  tf === t ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded transition-colors" title="Indicators">
            <BarChart2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded transition-colors" title="Show Levels">
            <Settings2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded transition-colors" title="Fullscreen">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Chart Canvas */}
      <div className="flex-1 w-full" ref={chartContainerRef} />
    </div>
  );
}
