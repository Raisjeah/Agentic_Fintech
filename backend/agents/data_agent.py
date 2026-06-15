import httpx
from typing import Dict, Any

class DataAgent:
    def __init__(self):
        self.base_url = "https://api.binance.com/api/v3"

    async def fetch_market_data(self, asset: str, timeframe: str) -> Dict[str, Any]:
        """
        Fetch OHLCV data from Binance.
        asset: e.g., 'BTC/USDT' -> 'BTCUSDT'
        timeframe: e.g., '4H' -> '4h'
        """
        symbol = asset.replace("/", "")
        # convert timeframe format if necessary (e.g., '4H' -> '4h')
        tf = timeframe.lower()
        
        url = f"{self.base_url}/klines"
        params = {
            "symbol": symbol,
            "interval": tf,
            "limit": 100
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Binance klines format: [Open time, Open, High, Low, Close, Volume, ...]
            ohlcv = [
                {
                    "time": int(candle[0]),
                    "open": float(candle[1]),
                    "high": float(candle[2]),
                    "low": float(candle[3]),
                    "close": float(candle[4]),
                    "volume": float(candle[5])
                }
                for candle in data
            ]
            
            # Fetch 24hr ticker for price_change_24h
            ticker_url = f"{self.base_url}/ticker/24hr"
            ticker_params = {"symbol": symbol}
            ticker_res = await client.get(ticker_url, params=ticker_params)
            ticker_res.raise_for_status()
            ticker_data = ticker_res.json()
            
            return {
                "ohlcv": ohlcv,
                "volume": float(ticker_data["volume"]),
                "price_change_24h": float(ticker_data["priceChangePercent"]),
                "current_price": float(ticker_data["lastPrice"])
            }

data_agent = DataAgent()
