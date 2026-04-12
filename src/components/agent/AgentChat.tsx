"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Minus, Send, Loader2, Sparkles } from "lucide-react";

type AgentChatProps = {
  agentType: "photographer" | "company" | "admin";
  primaryColor?: string;
  userName: string;
  companyName?: string;
  onClose?: () => void;
  onMinimize?: () => void;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const SUBTITLES: Record<AgentChatProps["agentType"], string> = {
  photographer: "Your personal photography assistant",
  company: "Company operations assistant",
  admin: "Platform administration assistant",
};

const QUICK_ACTIONS: Record<AgentChatProps["agentType"], { icon: string; label: string; message: string }[]> = {
  photographer: [
    { icon: "\u{1F4CA}", label: "Weekly report", message: "Give me my weekly performance report" },
    { icon: "\u{1F4F1}", label: "Social post", message: "Write me a social media post for my latest shoot" },
    { icon: "\u{1F4E7}", label: "Email client", message: "Draft a follow-up email for my recent client" },
    { icon: "\u{1F3AF}", label: "Marketing tips", message: "Give me marketing tips to get more bookings" },
  ],
  company: [
    { icon: "\u{1F4CA}", label: "Daily briefing", message: "Give me today's daily briefing" },
    { icon: "\u{1F465}", label: "Staff report", message: "Show me the staff performance report" },
    { icon: "\u{1F4B0}", label: "Revenue", message: "What's our revenue looking like this week?" },
    { icon: "\u26A0\uFE0F", label: "Alerts", message: "Are there any alerts or issues I should know about?" },
  ],
  admin: [
    { icon: "\u{1F4CA}", label: "Revenue report", message: "Show me the platform revenue report" },
    { icon: "\u{1F3E2}", label: "Find partners", message: "Help me find new partnership opportunities" },
    { icon: "\u{1F4E7}", label: "Draft email", message: "Draft a partnership outreach email" },
    { icon: "\u{1F5FA}\uFE0F", label: "Roadmap", message: "Show me the product roadmap status" },
  ],
};

const WELCOME_CAPABILITIES: Record<AgentChatProps["agentType"], { icon: string; label: string }[]> = {
  photographer: [
    { icon: "\u{1F4F1}", label: "Social Media" },
    { icon: "\u{1F4E7}", label: "Emails" },
    { icon: "\u{1F4CA}", label: "Analytics" },
    { icon: "\u{1F3AF}", label: "Marketing" },
    { icon: "\u{1F5BC}\uFE0F", label: "Image Editing" },
    { icon: "\u{1F310}", label: "SEO" },
  ],
  company: [
    { icon: "\u{1F465}", label: "Staff Mgmt" },
    { icon: "\u{1F4B0}", label: "Revenue" },
    { icon: "\u{1F4C5}", label: "Shifts" },
    { icon: "\u26A0\uFE0F", label: "Alerts" },
    { icon: "\u{1F4CA}", label: "Performance" },
    { icon: "\u{1F3E8}", label: "Destinations" },
  ],
  admin: [
    { icon: "\u{1F4CA}", label: "Revenue" },
    { icon: "\u{1F3E2}", label: "Partnerships" },
    { icon: "\u{1F4E7}", label: "Emails" },
    { icon: "\u{1F5FA}\uFE0F", label: "Roadmap" },
    { icon: "\u{1F4A1}", label: "Product Ideas" },
    { icon: "\u{1F50D}", label: "SEO" },
    { icon: "\u{1F60A}", label: "Customer Joy" },
    { icon: "\u{1F4C8}", label: "Growth" },
  ],
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AgentChat({
  agentType,
  primaryColor = "#0EA5A5",
  userName,
  companyName,
  onClose,
  onMinimize,
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [briefingLoaded, setBriefingLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch briefing on mount
  useEffect(() => {
    if (briefingLoaded) return;
    async function fetchBriefing() {
      try {
        const res = await fetch("/api/agent/briefing");
        if (res.ok) {
          const data = await res.json();
          if (data.briefing) {
            setMessages([
              { role: "assistant", content: data.briefing, timestamp: new Date() },
            ]);
          }
        }
      } catch {
        // Briefing fetch failed silently — user can still chat
      }
      setBriefingLoaded(true);
    }
    fetchBriefing();
  }, [briefingLoaded]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim() }),
        });

        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.response || data.message || "I couldn't process that request.", timestamp: new Date() },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Sorry, something went wrong. Please try again.", timestamp: new Date() },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Connection error. Please check your network and try again.", timestamp: new Date() },
        ]);
      }

      setLoading(false);
    },
    [loading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (message: string) => {
    sendMessage(message);
  };

  const handleClose = () => {
    setShowPanel(false);
    onClose?.();
  };

  const handleMinimize = () => {
    setShowPanel(false);
    onMinimize?.();
  };

  if (!showPanel) return null;

  const quickActions = QUICK_ACTIONS[agentType];
  const capabilities = WELCOME_CAPABILITIES[agentType];
  const hasMessages = messages.length > 0;

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 flex"
      style={{ animation: "agent-slide-in 0.3s ease-out" }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20" onClick={handleClose} />

      {/* Panel */}
      <div className="relative ml-auto flex h-full w-[400px] max-w-[90vw] flex-col rounded-l-2xl bg-white shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between rounded-tl-2xl px-5 py-4"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Fotiqo Agent</h2>
              <p className="text-xs text-white/80">{SUBTITLES[agentType]}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleMinimize}
              className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
              aria-label="Minimize"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!hasMessages ? (
            /* Empty state / Welcome */
            <div className="flex h-full flex-col items-center justify-center px-2">
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                <Sparkles className="h-7 w-7" style={{ color: primaryColor }} />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-gray-800">
                Welcome, {userName}!
              </h3>
              <p className="mb-5 text-center text-sm text-gray-500">
                I&apos;m your Fotiqo Agent. Here&apos;s what I can help with:
              </p>
              <div className="grid w-full grid-cols-2 gap-2">
                {capabilities.map((cap) => (
                  <button
                    key={cap.label}
                    onClick={() => handleQuickAction(`Tell me about ${cap.label.toLowerCase()}`)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <span className="text-base">{cap.icon}</span>
                    <span>{cap.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-5 text-center text-xs text-gray-400">
                Ask me anything about your business!
              </p>
            </div>
          ) : (
            /* Message list */
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      msg.role === "user"
                        ? "rounded-br-md bg-teal-50 text-gray-800"
                        : "rounded-bl-md border border-gray-100 bg-white text-gray-800"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </div>
                    <div className="mt-1 text-right text-[10px] text-gray-400">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Quick actions */}
        {hasMessages && (
          <div className="flex gap-1.5 overflow-x-auto border-t border-gray-100 px-4 py-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.message)}
                disabled={loading}
                className="flex shrink-0 items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <form onSubmit={handleSubmit} className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your agent..."
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: primaryColor }}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          {companyName && (
            <p className="mt-1.5 text-center text-[10px] text-gray-300">
              Powered by Fotiqo for {companyName}
            </p>
          )}
        </form>
      </div>

      {/* Slide-in animation */}
      <style jsx>{`
        @keyframes agent-slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
