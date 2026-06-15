import json
import os
from datetime import datetime
from typing import Dict, Any

class AuditLogger:
    def __init__(self):
        self.log_file = "audit_trail.jsonl"
        
    def log_decision(self, analysis_id: str, action: str, user_id: str = "system", reason: str = "", outcome: str = None):
        """
        Log user decisions (approve, reject, outcome) into a permanent audit trail.
        """
        entry = {
            "analysis_id": analysis_id,
            "action": action,
            "user_id": user_id,
            "reason": reason,
            "outcome": outcome,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        try:
            with open(self.log_file, "a") as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            print(f"Failed to write audit log: {e}")

audit_logger = AuditLogger()
