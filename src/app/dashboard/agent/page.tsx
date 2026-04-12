"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, MessageSquare, Image, Mail, Globe,
  TrendingUp, Target, Share2, Send, Loader2,
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const skills = [
  { icon: MessageSquare, label: "Customer Service" },
  { icon: Share2, label: "Social Media" },
  { icon: Mail, label: "Email Marketing" },
  { icon: Image, label: "Image Editing" },
  { icon: Globe, label: "Website & SEO" },
  { icon: Sparkles, label: "Packages" },
  { icon: TrendingUp, label: "Analytics" },
  { icon: Target, label: "Marketing" },
];

const quickActions = [
  { emoji: "📊", label: "Daily briefing" },
  { emoji: "📸", label: "Gallery tips" },
  { emoji: "📧", label: "Draft email" },
  { emoji: "💡", label: "Marketing ideas" },
];

export default function AgentPage() {
  const [userName, setUserName] = useState("Photographer");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [briefing, setBriefing] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => { if (d.name) setUserName(d.name); })
      .catch(() => {});

    // Fetch initial briefing
    fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Give me a brief daily summary", agentType: "photographer" }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.reply) setBriefing(d.reply); })
      .catch(() => setBriefing("Welcome! I'm your Fotiqo Agent. Ask me anything about your photography business."));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), agentType: "photographer" }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "I couldn't process that. Please try again." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-navy-900">Fotiqo Agent</h1>
            <p className="text-sm text-navy-400">Your AI business assistant</p>
          </div>
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {skills.map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <s.icon className="h-5 w-5 mx-auto mb-2" style={{ color: "#0EA5A5" }} />
              <div className="text-xs font-medium text-navy-700">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Embedded chat */}
        <div className="card overflow-hidden flex flex-col" style={{ height: "calc(100vh - 340px)", minHeight: "400px" }}>
          {/* Messages area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Briefing */}
            {briefing && messages.length === 0 && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="bg-cream-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-navy-700 whitespace-pre-wrap">{briefing}</p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-brand-600 text-white rounded-tr-md"
                      : "bg-cream-100 text-navy-700 rounded-tl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="bg-cream-100 rounded-2xl rounded-tl-md px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-navy-400" />
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="px-5 py-3 border-t border-cream-200 flex gap-2 overflow-x-auto">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => sendMessage(a.label)}
                disabled={sending}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-cream-300 bg-white text-navy-600 hover:border-brand-300 hover:text-brand-600 transition disabled:opacity-50"
              >
                {a.emoji} {a.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-cream-200">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask your agent anything, ${userName}...`}
                disabled={sending}
                className="flex-1 px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="px-4 py-2.5 rounded-xl text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "#0EA5A5" }}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
