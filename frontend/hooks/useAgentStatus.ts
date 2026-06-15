import { useState, useEffect } from "react";

export function useAgentStatus(analysisId: string | null) {
  const [messages, setMessages] = useState<{ node: string; status: string }[]>([]);

  useEffect(() => {
    if (!analysisId) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const wsUrl = backendUrl.replace("http", "ws") + "/ws/agents";
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.analysis_id === analysisId) {
          setMessages((prev) => [...prev, { node: data.node, status: data.status }]);
        }
      } catch (e) {
        console.error("Failed to parse ws message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [analysisId]);

  return messages;
}
