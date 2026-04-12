"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, ArrowLeft, Users, MapPin, DollarSign,
  Calendar, Settings, AlertTriangle, TrendingUp, BarChart3,
  Loader2, Send,
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const skills = [
  { icon: Users, label: "Staff Management" },
  { icon: DollarSign, label: "Revenue Analysis" },
  { icon: Calendar, label: "Shift Planning" },
  { icon: AlertTriangle, label: "Alerts & Monitoring" },
  { icon: MapPin, label: "Destination Performance" },
  { icon: DollarSign, label: "Cash Management" },
  { icon: Settings, label: "Equipment Status" },
  { icon: TrendingUp, label: "Forecasting" },
];

const quickActions = [
  { emoji: "📊", label: "Daily briefing" },
  { emoji: "👥", label: "Staff performance" },
  { emoji: "💰", label: "Revenue report" },
  { emoji: "⚠️", label: "Check alerts" },
];

export default function VenueAgentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [companyName, setCompanyName] = useState("Company");
  const [primaryColor, setPrimaryColor] = useState("#0EA5A5");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/v/${slug}/dashboard`);
        if (res.ok) {
          const data = await res.json();
          setCompanyName(data.org?.brandName || data.org?.name || "Company");
          setPrimaryColor(data.org?.brandPrimaryColor || "#0EA5A5");
        }
      } catch {}
      setLoading(false);

      // Fetch briefing
      try {
        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "Give me a brief daily operations summary", agentType: "venue", context: slug }),
        });
        const data = await res.json();
        if (data.reply) setBriefing(data.reply);
      } catch {
        setBriefing("Welcome! I'm your Fotiqo venue agent. Ask me about staff, revenue, operations, and more.");
      }
    }
    load();
  }, [slug]);

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
        body: JSON.stringify({ message: text.trim(), agentType: "venue", context: slug }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "I couldn't process that. Please try again." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/v/${slug}/dashboard`}
              className="text-navy-400 hover:text-navy-600 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl text-navy-900">{companyName} Agent</h1>
              <p className="text-xs text-navy-400">AI operations assistant</p>
            </div>
          </div>
          <Link href={`/v/${slug}/dashboard`} className="text-sm text-navy-400 hover:text-navy-600 transition">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Skills grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {skills.map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <s.icon className="h-5 w-5 mx-auto mb-2" style={{ color: primaryColor }} />
              <div className="text-xs font-medium text-navy-700">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Embedded chat */}
        <div className="card overflow-hidden flex flex-col" style={{ height: "calc(100vh - 340px)", minHeight: "400px" }}>
          {/* Messages area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {briefing && messages.length === 0 && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
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
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                    msg.role === "user"
                      ? "text-white rounded-tr-md"
                      : "bg-cream-100 text-navy-700 rounded-tl-md"
                  }`}
                  style={msg.role === "user" ? { background: primaryColor } : {}}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
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
                placeholder="Ask about staff, revenue, operations..."
                disabled={sending}
                className="flex-1 px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="px-4 py-2.5 rounded-xl text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
                style={{ background: primaryColor }}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
