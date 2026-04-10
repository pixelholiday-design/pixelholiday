"use client";
import { useEffect, useState } from "react";
import { MessageCircle, Clock, Check, AlertTriangle, Send, Star, Loader2 } from "lucide-react";

type Chat = { id: string; visitorName: string | null; visitorEmail: string | null; userRole: string | null; status: string; page: string | null; product: string | null; csatScore: number | null; createdAt: string; updatedAt: string; messages: { content: string; sender: string; createdAt: string }[]; _count: { messages: number } };

const STATUS_COLORS: Record<string, string> = { ACTIVE: "bg-green-100 text-green-700", WAITING_FOR_ADMIN: "bg-coral-100 text-coral-700", ADMIN_REPLIED: "bg-blue-100 text-blue-700", RESOLVED: "bg-cream-200 text-navy-500", CLOSED: "bg-cream-200 text-navy-400" };

export default function AdminSupportPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [stats, setStats] = useState({ active: 0, waiting: 0, resolved: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/support/chat").then((r) => r.json()).then((d) => { setChats(d.chats || []); setStats(d.stats || {}); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function loadChat(id: string) {
    setSelected(id);
    const res = await fetch(`/api/support/chat/${id}`).then((r) => r.json()).catch(() => ({}));
    setMessages(res.messages || []);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-navy-900">Support</h1>
        <p className="text-navy-500 text-sm mt-1">Live chat management and customer support</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3"><MessageCircle className="h-5 w-5 text-green-500" /><div><div className="font-display text-xl text-navy-900">{stats.active}</div><div className="text-xs text-navy-400">Active</div></div></div>
        <div className="card p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-coral-500" /><div><div className="font-display text-xl text-navy-900">{stats.waiting}</div><div className="text-xs text-navy-400">Waiting for reply</div></div></div>
        <div className="card p-4 flex items-center gap-3"><Check className="h-5 w-5 text-brand-500" /><div><div className="font-display text-xl text-navy-900">{stats.resolved}</div><div className="text-xs text-navy-400">Resolved</div></div></div>
      </div>

      {loading ? <div className="text-center py-16"><Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-400" /></div> : chats.length === 0 ? (
        <div className="text-center py-16"><MessageCircle className="h-12 w-12 mx-auto text-navy-300 mb-3" /><p className="text-navy-500">No support chats yet.</p></div>
      ) : (
        <div className="card overflow-hidden">
          {chats.map((c) => (
            <button key={c.id} onClick={() => loadChat(c.id)} className={`w-full text-left px-5 py-4 border-b border-cream-100 flex items-center justify-between hover:bg-cream-50 transition ${selected === c.id ? "bg-brand-50" : ""}`}>
              <div>
                <div className="font-semibold text-navy-900 text-sm">{c.visitorName || c.visitorEmail || "Anonymous"}</div>
                <div className="text-xs text-navy-400 mt-0.5">{c.messages[0]?.content.slice(0, 60) || "No messages"}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[c.status] || "bg-cream-200 text-navy-500"}`}>{c.status.replace(/_/g, " ")}</span>
                <span className="text-[10px] text-navy-400">{c._count.messages} msgs</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
