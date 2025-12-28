import { useState, useEffect, useRef } from "react";
import { sendMessage, fetchConversationHistory } from "../api/chat.api";

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

  /* PERSISTENCE: Load chat history and session from backend and localStorage */
  useEffect(() => {
    const savedSessionId = localStorage.getItem("chatSessionId");

    if (savedSessionId) {
      setSessionId(savedSessionId);
      // Fetch conversation history from backend
      fetchConversationHistory(savedSessionId)
        .then((data) => {
          if (data.messages && data.messages.length > 0) {
            const formattedMessages: Message[] = data.messages.map((msg: any) => ({
              sender: msg.sender as "user" | "ai",
              text: msg.text,
              timestamp: msg.timestamp || Date.now(),
            }));
            setMessages(formattedMessages);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch conversation history:", err);
          // Fallback to localStorage if backend fetch fails
          const savedMessages = localStorage.getItem("chatMessages");
          if (savedMessages) {
            try {
              setMessages(JSON.parse(savedMessages));
            } catch (e) {
              console.error("Failed to parse saved messages", e);
            }
          }
        });
    } else {
      // No sessionId, try localStorage as fallback
      const savedMessages = localStorage.getItem("chatMessages");
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error("Failed to parse saved messages", e);
        }
      }
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

  return (
    <div className={`w-full sm:w-[672px] h-[700px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
      isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
    }`}>
      {/* HEADER */}
      <div className={`flex justify-between items-center px-6 py-4 border-b backdrop-blur-md ${
        isDarkMode
          ? 'border-gray-700 bg-gray-800/50'
          : 'border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
            isDarkMode ? 'bg-violet-600' : 'bg-gradient-to-br from-purple-500 to-blue-500'
          }`}>
            🤖
          </div>
          <div>
            <h2 className="text-lg font-bold m-0">
              AI Assistant
            </h2>
            <p className={`text-xs m-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {sessionId ? "Session active" : "New conversation"}
            </p>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className={`px-2.5 py-2.5 rounded-xl border-none cursor-pointer transition-all duration-200 text-xl hover:scale-110 ${
            isDarkMode ? 'bg-gray-700' : 'bg-white shadow-sm'
          }`}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* MESSAGES CONTAINER */}
      <div className={`flex-1 overflow-y-auto px-4 py-6 chat-scrollbar ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'
      }`}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Start a conversation
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              Type a message below to begin
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex gap-2 mb-4 animate-fadeIn ${
            message.sender === "user" ? 'justify-end' : 'justify-start'
          }`}>
            {message.sender === "ai" && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                isDarkMode ? 'bg-violet-600' : 'bg-gradient-to-br from-purple-500 to-blue-500'
              }`}>
                🤖
              </div>
            )}

            <div className={`max-w-[75%] px-4 py-3 shadow-md ${
              message.sender === "user"
                ? `${isDarkMode
                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-500'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-400'
                  } text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-[0.25rem]`
                : `${isDarkMode
                    ? 'bg-gray-800 text-gray-100 border border-gray-700'
                    : 'bg-gradient-to-br from-gray-100 to-blue-50 text-gray-900 border border-gray-200'
                  } rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-[0.25rem]`
            }`}>
              <p className="text-sm leading-6 m-0 whitespace-pre-wrap break-words">
                {message.text}
              </p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {message.sender === "user" && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                isDarkMode
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-br from-emerald-500 to-emerald-400'
              }`}>
                👤
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 mb-4 justify-start">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
              isDarkMode ? 'bg-violet-600' : 'bg-gradient-to-br from-purple-500 to-blue-500'
            }`}>
              🤖
            </div>
            <div className={`max-w-[75%] px-4 py-3 shadow-md rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm ${
              isDarkMode
                ? 'bg-gray-800 text-gray-100 border border-gray-700'
                : 'bg-gradient-to-br from-gray-100 to-blue-50 text-gray-900 border border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className={`w-2 h-2 rounded-full inline-block mx-0.5 animate-bounce ${
                    isDarkMode ? 'bg-purple-400' : 'bg-purple-500'
                  }`} style={{ animationDelay: '0ms' }} />
                  <span className={`w-2 h-2 rounded-full inline-block mx-0.5 animate-bounce ${
                    isDarkMode ? 'bg-purple-400' : 'bg-purple-500'
                  }`} style={{ animationDelay: '150ms' }} />
                  <span className={`w-2 h-2 rounded-full inline-block mx-0.5 animate-bounce ${
                    isDarkMode ? 'bg-purple-400' : 'bg-purple-500'
                  }`} style={{ animationDelay: '300ms' }} />
                </div>
                <p className={`text-sm italic m-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Agent is typing...
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className={`p-4 border-t backdrop-blur-md ${
        isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
      }`}>
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={loading ? "Agent is typing..." : "Type your message..."}
            className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all duration-200 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${
              isDarkMode
                ? 'border-gray-700 bg-gray-900 text-gray-100'
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          />

          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`px-6 py-3 rounded-xl border-none text-white font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 ${
              isDarkMode
                ? 'bg-gradient-to-r from-violet-600 to-blue-600'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg'
            } ${
              loading || !input.trim() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
          >
            <span>Send</span>
            <span className="text-lg">📤</span>
          </button>
        </div>

        <p className={`text-xs mt-2 text-center ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};
