"use client";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Hash, Megaphone, Users, MapPin, Sparkles, AlertTriangle, Info } from "lucide-react";

type Channel = {
  id: string;
  name: string;
  type: "LOCATION" | "ROLE" | "DIRECT" | "ANNOUNCEMENT";
  description: string | null;
  locationName: string | null;
  unread: number;
  lastMessage: { content: string; createdAt: string; senderName: string } | null;
};

type Message = {
  id: string;
  content: string;
  type: "TEXT" | "IMAGE" | "SYSTEM" | "ALERT" | "AI_TIP";
  edited?: boolean;
  createdAt: string;
  senderId: string | null;
  sender: { id: string; name: string; role: string } | null;
};

const channelIcon = (type: Channel["type"]) => {
  if (type === "LOCATION") return MapPin;
  if (type === "ROLE") return Users;
  if (type === "ANNOUNCEMENT") return Megaphone;
  return Hash;
};

const messageStyle = (type: Message["type"]) => {
  if (type === "ALERT") return { bg: "bg-red-50 border-red-200", icon: AlertTriangle, iconColor: "text-red-600" };
  if (type === "AI_TIP") return { bg: "bg-purple-50 border-purple-200", icon: Sparkles, iconColor: "text-purple-600" };
  if (type === "SYSTEM") return { bg: "bg-blue-50 border-blue-200", icon: Info, iconColor: "text-blue-600" };
  return null;
};

export default function ChatPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function loadChannels() {
    const res = await fetch("/api/chat/channels", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setChannels(data.channels);
      if (!activeId && data.channels[0]) setActiveId(data.channels[0].id);
    }
  }

  async function loadMessages(id: string) {
    setLoading(true);
    const res = await fetch(`/api/chat/channels/${id}/messages`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 50);
  }

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activeId || sending) return;
    setSending(true);
    const res = await fetch(`/api/chat/channels/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });
    if (res.ok) {
      setInput("");
      await loadMessages(activeId);
      await loadChannels();
    } else {
      const e = await res.json().catch(() => ({}));
      alert(e.error || "Failed to send");
    }
    setSending(false);
  }

  const active = channels.find((c) => c.id === activeId);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-display text-navy-900">Team Chat</h1>
        <p className="text-sm text-navy-500">Location teams, role channels, and company announcements.</p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Channels list */}
        <aside className="w-72 bg-white rounded-xl border border-cream-300/60 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-cream-300/60">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">Channels</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {channels.length === 0 && (
              <div className="p-4 text-sm text-navy-400">No channels yet.</div>
            )}
            {channels.map((c) => {
              const Icon = channelIcon(c.type);
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-left px-4 py-3 border-b border-cream-100 hover:bg-cream-50 transition ${
                    isActive ? "bg-brand-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 mt-0.5 text-navy-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-sm text-navy-900 truncate">{c.name}</div>
                        {c.unread > 0 && (
                          <span className="bg-coral-500 text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      {c.lastMessage && (
                        <div className="text-xs text-navy-400 truncate mt-0.5">
                          <span className="font-medium">{c.lastMessage.senderName}:</span> {c.lastMessage.content}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Messages panel */}
        <section className="flex-1 bg-white rounded-xl border border-cream-300/60 flex flex-col overflow-hidden">
          {active ? (
            <>
              <div className="px-5 py-3 border-b border-cream-300/60">
                <div className="font-semibold text-navy-900">{active.name}</div>
                {active.description && (
                  <div className="text-xs text-navy-400">{active.description}</div>
                )}
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
                {loading && <div className="text-sm text-navy-400">Loading messages…</div>}
                {!loading && messages.length === 0 && (
                  <div className="text-sm text-navy-400">No messages yet — say hi 👋</div>
                )}
                {messages.map((m) => {
                  const style = messageStyle(m.type);
                  if (style) {
                    const Icon = style.icon;
                    return (
                      <div key={m.id} className={`rounded-lg border px-4 py-3 ${style.bg}`}>
                        <div className="flex items-start gap-2">
                          <Icon className={`h-4 w-4 mt-0.5 ${style.iconColor}`} />
                          <div className="flex-1">
                            <div className="text-xs font-semibold uppercase tracking-wider text-navy-500">
                              {m.type === "AI_TIP" ? "AI Tip" : m.type === "ALERT" ? "Alert" : "System"}
                            </div>
                            <div className="text-sm text-navy-900 mt-1">{m.content}</div>
                            <div className="text-[10px] text-navy-400 mt-1">
                              {new Date(m.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={m.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {m.sender?.name?.charAt(0) ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <div className="text-sm font-semibold text-navy-900">{m.sender?.name ?? "System"}</div>
                          <div className="text-[10px] text-navy-400 uppercase">{m.sender?.role}</div>
                          <div className="text-[10px] text-navy-400 ml-auto">
                            {new Date(m.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm text-navy-800 mt-0.5 whitespace-pre-wrap">
                          {m.content}
                          {m.edited && <span className="text-[10px] text-navy-400 ml-1">(edited)</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={sendMessage} className="border-t border-cream-300/60 p-3 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message #${active.name}`}
                  className="flex-1 px-4 py-2 rounded-lg border border-cream-300 focus:border-brand-500 focus:outline-none text-sm bg-cream-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="px-4 py-2 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="h-4 w-4" /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-navy-400">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm">Select a channel to start chatting</div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
