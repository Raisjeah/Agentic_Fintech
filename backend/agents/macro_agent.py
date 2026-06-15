import os
from typing import Dict, Any
from core.llm import get_llm_client, LLMProvider
import json

class MacroAgent:
    def __init__(self):
        self.fred_api_key = os.getenv("FRED_API_KEY", "")
        self.llm = get_llm_client(provider=LLMProvider.GEMINI, task="fast")
        
    async def fetch_macro(self, asset: str, timeframe: str) -> Dict[str, Any]:
        """
        Fetch macro events (from FRED API if key exists, else fallback to mock data) and interpret.
        """
        import asyncio
        
        def fetch_fred_data():
            events = []
            if self.fred_api_key:
                try:
                    import urllib.request
                    import json
                    
                    # Fetch FEDFUNDS
                    fedfunds_url = f"https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key={self.fred_api_key}&limit=1&sort_order=desc&file_type=json"
                    req = urllib.request.Request(fedfunds_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=5) as response:
                        data = json.loads(response.read().decode())
                        if "observations" in data and len(data["observations"]) > 0:
                            obs = data["observations"][0]
                            events.append({
                                "name": "Fed Funds Rate (FEDFUNDS)",
                                "time": obs.get("date"),
                                "impact": "High",
                                "forecast": "N/A",
                                "previous": obs.get("value")
                            })
                    
                    # Fetch CPIAUCSL
                    cpi_url = f"https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key={self.fred_api_key}&limit=1&sort_order=desc&file_type=json"
                    req_cpi = urllib.request.Request(cpi_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req_cpi, timeout=5) as response_cpi:
                        data_cpi = json.loads(response_cpi.read().decode())
                        if "observations" in data_cpi and len(data_cpi["observations"]) > 0:
                            obs_cpi = data_cpi["observations"][0]
                            events.append({
                                "name": "Consumer Price Index (CPIAUCSL)",
                                "time": obs_cpi.get("date"),
                                "impact": "High",
                                "forecast": "N/A",
                                "previous": obs_cpi.get("value")
                            })
                except Exception as e:
                    print(f"FRED API fetch error: {e}")
            return events

        events = await asyncio.to_thread(fetch_fred_data)
        if not events:
            # Fallback to mock data
            events = [
                {"name": "US CPI Data Release", "time": "In 3 hours", "impact": "High", "forecast": "3.1%", "previous": "3.2%"},
                {"name": "Fed Interest Rate Decision", "time": "Tomorrow", "impact": "High", "forecast": "5.25%", "previous": "5.25%"}
            ]

        prompt = f"""
        Analyze the upcoming macro economic events and their potential impact on {asset}.
        
        Events:
        {json.dumps(events, indent=2)}
        
        Provide a JSON response with exactly this format:
        {{
            "events": (return the same events list, optionally with an added "expected_impact" tag per event),
            "assessment": "Brief summary of how these macro events will affect the asset's volatility or direction"
        }}
        Do not include markdown blocks, just raw JSON.
        """
        
        try:
            llm_res = await asyncio.to_thread(self.llm.generate, prompt)
            if llm_res.startswith("```json"):
                llm_res = llm_res[7:-3]
            elif llm_res.startswith("```"):
                llm_res = llm_res[3:-3]
                
            parsed_res = json.loads(llm_res.strip())
            
            return {
                "events": parsed_res.get("events", events),
                "assessment": parsed_res.get("assessment", "High volatility expected due to macro events.")
            }
            
        except Exception as e:
            print(f"MacroAgent LLM parsing error: {e}")
            return {
                "events": events,
                "assessment": "Failed to analyze macro events."
            }

macro_agent = MacroAgent()
