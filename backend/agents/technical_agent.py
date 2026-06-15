import pandas as pd
import pandas_ta as ta
from typing import Dict, Any

class TechnicalAgent:
    def analyze(self, ohlcv: list) -> Dict[str, Any]:
        """
        Calculate technical indicators and identify patterns.
        ohlcv: list of dicts with keys 'time', 'open', 'high', 'low', 'close', 'volume'
        """
        if not ohlcv:
            return {"error": "No OHLCV data provided"}
            
        df = pd.DataFrame(ohlcv)
        
        # Calculate indicators
        # RSI
        df['rsi'] = ta.rsi(df['close'], length=14)
        
        # MACD
        macd = ta.macd(df['close'])
        df = pd.concat([df, macd], axis=1)
        
        # EMAs
        df['ema_20'] = ta.ema(df['close'], length=20)
        df['ema_50'] = ta.ema(df['close'], length=50)
        df['ema_200'] = ta.ema(df['close'], length=200)
        
        # Bollinger Bands
        bb = ta.bbands(df['close'], length=20)
        df = pd.concat([df, bb], axis=1)
        
        # Get latest values
        latest = df.iloc[-1]
        
        rsi_val = float(latest['rsi']) if pd.notna(latest['rsi']) else 50.0
        
        # MACD columns typically MACD_12_26_9, MACDh_12_26_9, MACDs_12_26_9
        macd_val = float(latest.filter(like='MACD_').iloc[0]) if len(latest.filter(like='MACD_')) > 0 and pd.notna(latest.filter(like='MACD_').iloc[0]) else 0.0
        macds_val = float(latest.filter(like='MACDs_').iloc[0]) if len(latest.filter(like='MACDs_')) > 0 and pd.notna(latest.filter(like='MACDs_').iloc[0]) else 0.0
        
        ema_20 = float(latest['ema_20']) if pd.notna(latest['ema_20']) else None
        ema_50 = float(latest['ema_50']) if pd.notna(latest['ema_50']) else None
        ema_200 = float(latest['ema_200']) if pd.notna(latest['ema_200']) else None
        
        bb_upper = float(latest.filter(like='BBU_').iloc[0]) if len(latest.filter(like='BBU_')) > 0 and pd.notna(latest.filter(like='BBU_').iloc[0]) else None
        bb_lower = float(latest.filter(like='BBL_').iloc[0]) if len(latest.filter(like='BBL_')) > 0 and pd.notna(latest.filter(like='BBL_').iloc[0]) else None
        
        # Basic signal logic for MVP
        signal = "NEUTRAL"
        strength = "MODERATE"
        
        if rsi_val > 70:
            signal = "SELL"
            strength = "STRONG" if rsi_val > 80 else "MODERATE"
        elif rsi_val < 30:
            signal = "BUY"
            strength = "STRONG" if rsi_val < 20 else "MODERATE"
        elif macd_val > macds_val and latest['close'] > ema_20:
            signal = "BUY"
        elif macd_val < macds_val and latest['close'] < ema_20:
            signal = "SELL"
            
        return {
            "rsi": rsi_val,
            "macd": {"value": macd_val, "signal": macds_val},
            "ema_20": ema_20,
            "ema_50": ema_50,
            "ema_200": ema_200,
            "bb_upper": bb_upper,
            "bb_lower": bb_lower,
            "support": [], # Placeholder for MVP
            "resistance": [], # Placeholder for MVP
            "pattern": "None", # Placeholder for MVP
            "signal": signal,
            "strength": strength
        }

technical_agent = TechnicalAgent()
