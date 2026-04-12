"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, TrendingUp, Building2, Mail, Map, Lightbulb,
  Search, SmilePlus, BarChart3, Send, Loader2,
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const skills = [
  { icon: TrendingUp, label: "Revenue & MRR" },
  { icon: Building2, label: "Partnerships" },
  { icon: Mail, label: "Email Drafting" },
  { icon: Map, label: "Roadmap to \u20AC10M" },
  { icon: Lightbulb, label: "Product Ideas" },
  { icon: Search, label: "SEO Analysis" },
  { icon: SmilePlus, label: "Customer Happiness" },
  { icon: BarChart3, label: "Growth Engine" },
];

const quickActions = [
  { emoji: "\uD83D\uDCCA", label: "Revenue report" },
  { emoji: "\uD83C\uDFE2", label: "Find partners" },
  { emoji: "\uD83D\uDCE7", label: "Draft email" },
  { emoji: "\uD83D\uDDFA\uFE0F", label: "Roadmap update" },
  { emoji: "\uD83D\uDCA1", label: "Feature ideas" },
  { emoji: "\uD83D\uDD0D", label: "SEO analysis" },
];

export default function AdminAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [briefing, setBriefing] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Give me a CEO-level daily briefing", agentType: "admin" }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.reply) setBriefing(d.reply); })
      .catch(() => setBriefing("Welcome, Joe. I'm your Fotiqo CEO agent. Ask me about revenue, partnerships, roadmap, or anything else."));
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
        body: JSON.stringify({ message: text.trim(), agentType: "admin" }),
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
    <div>
      {/* CEO Command Center Header */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "linear-gradient(135deg, #0EA5A5, #0C2E3D)" }}>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-white">Fotiqo Agent</h1>
            <p className="text-sm text-white/70">CEO Command Center</p>
          </div>
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
      <div className="card overflow-hidden flex flex-col" style={{ height: "calc(100vh - 480px)", minHeight: "400px" }}>
        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {briefing && messages.length === 0 && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-navy-700 flex items-center justify-center flex-shrink-0">
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
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-navy-700 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                  msg.role === "user"
                    ? "rounded-tr-md text-white"
                    : "bg-cream-100 text-navy-700 rounded-tl-md"
                }`}
                style={msg.role === "user" ? { background: "#0C2E3D" } : {}}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-navy-700 flex items-center justify-center flex-shrink-0">
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
              placeholder="Ask about revenue, partners, roadmap, growth..."
              disabled={sending}
              className="flex-1 px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-4 py-2.5 rounded-xl text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "#0C2E3D" }}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Roadmap Progress */}
      <div className="card p-6 mt-6">
        <h3 className="font-display text-lg text-navy-900 mb-3">Roadmap Progress</h3>
        <div className="flex items-center justify-between text-sm text-navy-600 mb-2">
          <span>EUR 10M Goal</span>
          <span className="font-medium">10%</span>
        </div>
        <div className="w-full h-3 bg-cream-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: "10%", background: "linear-gradient(90deg, #0EA5A5, #F97316)" }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-navy-400">EUR 1M / EUR 10M</span>
          <span className="text-xs text-navy-400">Current MRR: calculating...</span>
        </div>
      </div>
    </div>
  );
}
