from typing import Dict, Any, List

class MoneyManagementAgent:
    def calculate(self, capital: float, risk_percent: float, entry: float, stop_loss: float, asset: str) -> Dict[str, Any]:
        """
        Calculate position sizing and risk management metrics.
        """
        # Calculate risk amount
        risk_amount = capital * (risk_percent / 100)
        
        # Calculate distance to stop loss
        sl_distance = abs(entry - stop_loss)
        if sl_distance == 0:
            raise ValueError("Entry and Stop Loss cannot be the same")
            
        # Calculate position size in asset units
        position_size = risk_amount / sl_distance
        
        # Calculate lot size (assuming 1 lot = 1 unit for crypto MVP, can adjust for forex later)
        lot_size = position_size
        
        # Calculate a default RR of 1:2 to find a basic TP if not provided
        # Or calculate RR if we know TP
        # MVP: Generate 2 basic TP levels at 1:1 and 1:2 RR
        is_long = entry > stop_loss
        
        tp1_price = entry + sl_distance if is_long else entry - sl_distance
        tp2_price = entry + (sl_distance * 2) if is_long else entry - (sl_distance * 2)
        
        tp_levels = [
            {"level": 1, "price": tp1_price, "size_percent": 50},
            {"level": 2, "price": tp2_price, "size_percent": 50}
        ]
        
        # Base max loss is simply the risk amount
        max_loss = risk_amount
        
        return {
            "risk_amount": risk_amount,
            "position_size": position_size,
            "lot_size": lot_size,
            "max_loss": max_loss,
            "rr_ratio": 2.0, # Defaulting to 1:2 for the overall trade plan
            "tp_levels": tp_levels
        }

money_agent = MoneyManagementAgent()
