"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Star, BookOpen, ShoppingBag, CreditCard, Bug, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

type Message = { id: string; content: string; sender: "USER" | "AI_BOT" | "ADMIN"; contentType: string; createdAt: string };

const STORAGE_KEY_MESSAGES = "fotiqo_chat_messages";
const STORAGE_KEY_CHAT_ID = "fotiqo_chat_id";

const QUICK_ACTIONS = [
  { icon: BookOpen, label: "Gallery Help", message: "How do I create and share a gallery?" },
  { icon: ShoppingBag, label: "Store Help", message: "How do I set up my online store?" },
  { icon: CreditCard, label: "Billing", message: "How does Fotiqo pricing work?" },
  { icon: Bug, label: "Technical Issue", message: "I need help with a technical issue" },
];

function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("fotiqo_chat_session");
  if (!id) { id = "sess_" + Math.random().toString(36).slice(2) + Date.now(); localStorage.setItem("fotiqo_chat_session", id); }
  return id;
}

function detectProduct(path: string): string {
  if (path.startsWith("/gallery")) return "GALLERY";
  if (path.startsWith("/dashboard")) return "DASHBOARD";
  if (path.startsWith("/admin")) return "ADMIN";
  if (path.startsWith("/kiosk")) return "KIOSK";
  if (path.startsWith("/find-photographer")) return "MARKETPLACE";
  if (path.startsWith("/book")) return "BOOKING";
  if (path.startsWith("/shop")) return "SHOP";
  return "MARKETING";
}

function loadMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted data, ignore */ }
  return [];
}

function saveMessages(msgs: Message[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(msgs));
  } catch { /* storage full, ignore */ }
}

function loadChatId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_CHAT_ID);
}

function saveChatId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(STORAGE_KEY_CHAT_ID, id);
  else localStorage.removeItem(STORAGE_KEY_CHAT_ID);
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [showCsat, setShowCsat] = useState(false);
  const [csatScore, setCsatScore] = useState(0);
  const [escalated, setEscalated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Restore messages and chatId from localStorage on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const restored = loadMessages();
    if (restored.length > 0) setMessages(restored);
    const storedChatId = loadChatId();
    if (storedChatId) setChatId(storedChatId);
  }, []);

  // Listen for external open-chat events (e.g., from Help page)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("fotiqo:open-chat", handler);
    return () => window.removeEventListener("fotiqo:open-chat", handler);
  }, []);

  // Persist messages whenever they change
  useEffect(() => {
    if (initialized.current && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  // Persist chatId whenever it changes
  useEffect(() => {
    saveChatId(chatId);
  }, [chatId]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { if (open) scrollToBottom(); }, [messages, open]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `u_${Date.now()}`, content: text, sender: "USER", contentType: "TEXT", createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: getSessionId(),
          chatId,
          page: pathname,
          product: detectProduct(pathname),
        }),
      }).then((r) => r.json());

      if (res.chatId) setChatId(res.chatId);
      if (res.response) {
        const botMsg: Message = {
          id: `b_${Date.now()}`,
          content: res.response.content,
          sender: res.response.sender || "AI_BOT",
          contentType: res.response.contentType || "TEXT",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);

        if (res.response.shouldEscalate) {
          setEscalated(true);
        }
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: `e_${Date.now()}`, content: "Sorry, I couldn't connect. Please try again.", sender: "AI_BOT", contentType: "TEXT", createdAt: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  }, [chatId, pathname]);

  const handleEscalate = useCallback(() => {
    sendMessage("I'd like to speak with a support agent");
  }, [sendMessage]);

  async function submitCsat(score: number) {
    setCsatScore(score);
    if (chatId) {
      fetch(`/api/support/chat/${chatId}/csat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      }).catch(() => {});
    }
    setTimeout(() => setShowCsat(false), 2000);
  }

  // Don't show on kiosk, admin, dashboard, or venue portal pages (logged-in users have in-app support)
  if (
    pathname.startsWith("/kiosk") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/v/") ||
    pathname.startsWith("/contract/sign")
  ) return null;

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Floating button - teal circle with chat bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] h-14 w-14 rounded-full shadow-lift flex items-center justify-center transition-all duration-200 hover:scale-110 text-white"
          style={{ backgroundColor: "#0EA5A5" }}
          aria-label="Chat with support"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel - full screen on mobile, 380x520 on desktop */}
      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[9999] w-full sm:w-[380px] h-full sm:h-[520px] sm:rounded-2xl bg-white shadow-lift flex flex-col overflow-hidden animate-slide-up border border-cream-300">
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between text-white flex-shrink-0" style={{ background: "linear-gradient(to right, #0EA5A5, #12B5B5)" }}>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fotiqo-icon.svg" alt="" className="h-7 w-7 rounded-lg bg-white/20 p-0.5" />
              <div>
                <div className="font-semibold text-sm">Fotiqo Support</div>
                <div className="text-[10px] text-white/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300" /> Online
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-cream-50">
            {!hasMessages ? (
              /* Welcome state */
              <div className="space-y-3 animate-fade-in">
                <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm">
                  <p className="text-sm text-navy-800">Hi! I&apos;m Fotiqo&apos;s assistant. How can I help?</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((a) => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.label}
                        onClick={() => sendMessage(a.message)}
                        className="flex items-center gap-2 bg-white rounded-xl p-2.5 text-left text-xs font-medium text-navy-700 hover:bg-brand-50 hover:text-brand-600 transition shadow-sm border border-cream-200"
                      >
                        <Icon className="h-4 w-4 text-brand-400 flex-shrink-0" />
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.sender === "USER"
                      ? "bg-brand-500 text-white rounded-br-sm"
                      : msg.sender === "ADMIN"
                        ? "bg-navy-800 text-white rounded-bl-sm"
                        : "bg-white text-navy-800 rounded-bl-sm shadow-sm"
                  }`}>
                    {msg.sender === "ADMIN" && <div className="text-[10px] text-white/60 mb-0.5">Support Agent</div>}
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                </div>
              </div>
            )}
            {/* "Talk to a person" button - shown after some messages and not yet escalated */}
            {hasMessages && !escalated && !sending && (
              <div className="flex justify-center pt-1">
                <button
                  onClick={handleEscalate}
                  className="flex items-center gap-1.5 text-xs text-navy-500 hover:text-brand-600 transition bg-white rounded-full px-3 py-1.5 shadow-sm border border-cream-200"
                >
                  <UserRound className="h-3.5 w-3.5" />
                  Still need help? Talk to a person
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* CSAT Survey */}
          {showCsat && (
            <div className="px-4 py-3 bg-brand-50 border-t border-brand-100 text-center">
              <p className="text-xs text-navy-600 font-medium mb-2">How was your experience?</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => submitCsat(s)} className="transition hover:scale-125">
                    <Star className={`h-7 w-7 ${s <= csatScore ? "fill-gold-400 text-gold-400" : "text-cream-300"}`} />
                  </button>
                ))}
              </div>
              {csatScore > 0 && <p className="text-xs text-brand-600 mt-1">Thanks for your feedback!</p>}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2 border-t border-cream-200 bg-white flex-shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex items-center gap-2"
            >
              <input
                className="flex-1 bg-cream-50 rounded-xl px-3 py-2.5 text-sm text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-400 border border-cream-200"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
              />
              <button type="submit" disabled={sending || !input.trim()} className="h-10 w-10 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-cream-300 text-white flex items-center justify-center transition">
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="flex items-center justify-center gap-1 mt-1.5">
              <a href="/help" className="text-[10px] text-navy-400 hover:text-brand-500 transition">Help Center</a>
              <span className="text-navy-300 text-[10px]">&middot;</span>
              <span className="text-[10px] text-navy-300">Powered by Fotiqo</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
