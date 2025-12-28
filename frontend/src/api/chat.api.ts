const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export async function sendMessage(message: string, sessionId?: string) {
  const res = await fetch(`${API_BASE_URL}/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Server error");
  }

  return res.json(); // { reply, sessionId }
}

export async function fetchConversationHistory(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Server error");
  }

  return res.json(); // { messages: Array<{sender, text, timestamp}> }
}
