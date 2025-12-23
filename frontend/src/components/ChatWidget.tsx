import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { sendMessage } from "../api/chat.api";

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: number;
}

interface ChatWidgetProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isDarkMode, setIsDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* PERSISTENCE: Load chat history and session from localStorage */
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    const savedSessionId = localStorage.getItem("chatSessionId");

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    }

    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  /* PERSISTENCE: Save messages to localStorage */
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  /* PERSISTENCE: Save sessionId to localStorage */
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("chatSessionId", sessionId);
    }
  }, [sessionId]);

  /* PERSISTENCE: Save dark mode preference */
  useEffect(() => {
    localStorage.setItem("chatDarkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  /* AUTO-SCROLL: Smooth scroll to bottom when new messages arrive */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  /* SEND MESSAGE HANDLER */
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      sender: "user",
      text: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { reply, sessionId: newSessionId } = await sendMessage(
        userMessage.text,
        sessionId || undefined
      );

      setSessionId(newSessionId);

      const aiMessage: Message = {
        sender: "ai",
        text: reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: unknown) {
      const errorMessage: Message = {
        sender: "ai",
        text: `⚠️ Sorry, something went wrong: ${
          err instanceof Error ? err.message : "Unknown error"
        }. Please try again.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Styles
  const containerStyle: CSSProperties = {
    width: "100%",
    maxWidth: "672px",
    height: "700px",
    borderRadius: "1rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: "all 0.3s ease",
    backgroundColor: isDarkMode ? "#111827" : "#ffffff",
    color: isDarkMode ? "#f3f4f6" : "#111827",
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    borderBottom: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
    background: isDarkMode
      ? "rgba(31, 41, 55, 0.5)"
      : "linear-gradient(to right, #faf5ff, #eff6ff)",
    backdropFilter: "blur(10px)",
  };

  const headerLeftStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  };

  const avatarStyle: CSSProperties = {
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    background: isDarkMode
      ? "#7c3aed"
      : "linear-gradient(to bottom right, #a855f7, #3b82f6)",
  };

  const toggleButtonStyle: CSSProperties = {
    padding: "0.625rem",
    borderRadius: "0.75rem",
    border: "none",
    background: isDarkMode ? "#374151" : "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "1.25rem",
    boxShadow: isDarkMode ? "none" : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  };

  const messagesContainerStyle: CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "1.5rem 1rem",
    background: isDarkMode
      ? "#111827"
      : "linear-gradient(to bottom, #f9fafb, #ffffff)",
  };

  const emptyStateStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center",
  };

  const messageRowStyle = (isUser: boolean): CSSProperties => ({
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
    justifyContent: isUser ? "flex-end" : "flex-start",
    animation: "fadeIn 0.3s ease-in",
  });

  const messageBubbleStyle = (isUser: boolean): CSSProperties => ({
    maxWidth: "75%",
    padding: "0.75rem 1rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    ...(isUser
      ? {
          background: isDarkMode
            ? "linear-gradient(to bottom right, #059669, #10b981)"
            : "linear-gradient(to bottom right, #10b981, #34d399)",
          color: "#ffffff",
          borderBottomRightRadius: "0.25rem",
        }
      : {
          background: isDarkMode ? "#1f2937" : "linear-gradient(to bottom right, #f3f4f6, #dbeafe)",
          color: isDarkMode ? "#f3f4f6" : "#111827",
          border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
          borderBottomLeftRadius: "0.25rem",
        }),
  });

  const smallAvatarStyle = (isUser: boolean): CSSProperties => ({
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.875rem",
    flexShrink: 0,
    background: isUser
      ? isDarkMode
        ? "#059669"
        : "linear-gradient(to bottom right, #10b981, #34d399)"
      : isDarkMode
      ? "#7c3aed"
      : "linear-gradient(to bottom right, #a855f7, #3b82f6)",
  });

  const inputAreaStyle: CSSProperties = {
    padding: "1rem",
    borderTop: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
    background: isDarkMode ? "rgba(31, 41, 55, 0.5)" : "rgba(249, 250, 251, 0.5)",
    backdropFilter: "blur(10px)",
  };

  const inputRowStyle: CSSProperties = {
    display: "flex",
    gap: "0.75rem",
  };

  const inputStyle: CSSProperties = {
    flex: 1,
    padding: "0.75rem 1rem",
    borderRadius: "0.75rem",
    border: `2px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
    background: isDarkMode ? "#111827" : "#ffffff",
    color: isDarkMode ? "#f3f4f6" : "#111827",
    fontSize: "0.875rem",
    outline: "none",
    transition: "all 0.2s",
  };

  const sendButtonStyle: CSSProperties = {
    padding: "0.75rem 1.5rem",
    borderRadius: "0.75rem",
    border: "none",
    background: isDarkMode
      ? "linear-gradient(to right, #7c3aed, #2563eb)"
      : "linear-gradient(to right, #a855f7, #3b82f6)",
    color: "#ffffff",
    fontWeight: 500,
    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
    opacity: loading || !input.trim() ? 0.5 : 1,
    transition: "all 0.2s",
    boxShadow: isDarkMode ? "none" : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const hintTextStyle: CSSProperties = {
    fontSize: "0.75rem",
    marginTop: "0.5rem",
    textAlign: "center",
    color: isDarkMode ? "#6b7280" : "#9ca3af",
  };

  const typingDotStyle: CSSProperties = {
    width: "0.5rem",
    height: "0.5rem",
    borderRadius: "50%",
    backgroundColor: isDarkMode ? "#a78bfa" : "#a855f7",
    display: "inline-block",
    margin: "0 0.125rem",
    animation: "bounce 1.4s infinite ease-in-out both",
  };

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={avatarStyle}>🤖</div>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
              AI Assistant
            </h2>
            <p
              style={{
                fontSize: "0.75rem",
                color: isDarkMode ? "#9ca3af" : "#6b7280",
                margin: 0,
              }}
            >
              {sessionId ? "Session active" : "New conversation"}
            </p>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          style={toggleButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* MESSAGES CONTAINER */}
      <div style={messagesContainerStyle} className="chat-scrollbar">
        {messages.length === 0 && (
          <div style={emptyStateStyle}>
            <div style={{ fontSize: "3.75rem", marginBottom: "1rem" }}>💬</div>
            <p
              style={{
                fontSize: "1.125rem",
                fontWeight: 500,
                color: isDarkMode ? "#d1d5db" : "#4b5563",
              }}
            >
              Start a conversation
            </p>
            <p
              style={{
                fontSize: "0.875rem",
                marginTop: "0.5rem",
                color: isDarkMode ? "#6b7280" : "#9ca3af",
              }}
            >
              Type a message below to begin
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} style={messageRowStyle(message.sender === "user")}>
            {message.sender === "ai" && (
              <div style={smallAvatarStyle(false)}>🤖</div>
            )}

            <div style={messageBubbleStyle(message.sender === "user")}>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {message.text}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                  opacity: 0.7,
                }}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {message.sender === "user" && (
              <div style={smallAvatarStyle(true)}>👤</div>
            )}
          </div>
        ))}

        {loading && (
          <div style={messageRowStyle(false)}>
            <div style={smallAvatarStyle(false)}>🤖</div>
            <div style={messageBubbleStyle(false)}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <span style={{ ...typingDotStyle, animationDelay: "0ms" }} />
                  <span style={{ ...typingDotStyle, animationDelay: "150ms" }} />
                  <span style={{ ...typingDotStyle, animationDelay: "300ms" }} />
                </div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontStyle: "italic",
                    color: isDarkMode ? "#9ca3af" : "#4b5563",
                    margin: 0,
                  }}
                >
                  Agent is typing...
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div style={inputAreaStyle}>
        <div style={inputRowStyle}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={loading ? "Agent is typing..." : "Type your message..."}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#a855f7";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168, 85, 247, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = isDarkMode ? "#374151" : "#d1d5db";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={sendButtonStyle}
            onMouseEnter={(e) => {
              if (!loading && input.trim()) {
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <span>Send</span>
            <span style={{ fontSize: "1.125rem" }}>📤</span>
          </button>
        </div>

        <p style={hintTextStyle}>
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

