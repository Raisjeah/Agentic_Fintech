"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, ISeriesApi, CandlestickData, CandlestickSeries } from "lightweight-charts";
import { Maximize2, Settings2, BarChart2 } from "lucide-react";

export default function ChartPanel({ asset = "BTC/USDT" }: { asset?: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
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
      // 1. Fetch real historical candles
      fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=4h&limit=200`)
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
          ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@kline_4h`);
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

    // Add Overlay Lines (dummy analysis overlay)
    candlestickSeries.createPriceLine({
      price: 63000,
      color: "#FF3B5C",
      lineWidth: 2,
      lineStyle: 0,
      axisLabelVisible: true,
      title: "SL",
    });
    
    candlestickSeries.createPriceLine({
      price: 67500,
      color: "#00D4AA",
      lineWidth: 2,
      lineStyle: 3,
      axisLabelVisible: true,
      title: "TP1",
    });

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ws) ws.close();
      chart.remove();
    };
  }, [asset]);

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
