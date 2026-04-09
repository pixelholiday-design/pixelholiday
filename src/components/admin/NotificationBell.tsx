"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, MessageSquare, ShoppingCart, Brain, X } from "lucide-react";

interface Notification {
  id: string;
  type: "chat" | "order" | "insight";
  title: string;
  body: string;
  href: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch {
        // silent
      }
    };
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const count = notifications.length;

  const icon = (type: string) => {
    switch (type) {
      case "chat": return <MessageSquare className="h-4 w-4 text-brand-500" />;
      case "order": return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case "insight": return <Brain className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost relative"
        title={`${count} notification${count === 1 ? "" : "s"}`}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-coral-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-cream-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-cream-50 border-b border-cream-200">
            <span className="font-semibold text-sm text-navy-900">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-navy-400 hover:text-navy-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-navy-400">
                All caught up!
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-cream-50 transition-colors border-b border-cream-100 last:border-0"
                >
                  <div className="mt-0.5">{icon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-900 truncate">{n.title}</div>
                    <div className="text-xs text-navy-500 truncate">{n.body}</div>
                    <div className="text-[10px] text-navy-300 mt-0.5">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="px-4 py-2 bg-cream-50 border-t border-cream-200">
            <Link
              href="/admin/chat"
              onClick={() => setOpen(false)}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              View all messages →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
