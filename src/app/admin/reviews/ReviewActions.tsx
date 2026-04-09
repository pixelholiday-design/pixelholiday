"use client";
import { useState } from "react";
import { Send, Check, Loader2, Mail, Clock } from "lucide-react";

type OrderInfo = {
  id: string;
  customerName: string;
  customerEmail: string;
  photographerName: string;
  galleryId: string;
  date: string;
};

export default function ReviewActions({
  orders,
  googleReviewLink,
  instagramLink,
}: {
  orders: OrderInfo[];
  googleReviewLink: string;
  instagramLink: string;
}) {
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<string | null>(null);

  async function sendReviewRequest(order: OrderInfo) {
    if (!order.customerEmail) return;
    setSending(order.id);
    try {
      // Call the review request email endpoint
      const res = await fetch("/api/admin/send-review-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: order.customerEmail,
          customerName: order.customerName,
          photographerName: order.photographerName,
          galleryId: order.galleryId,
          googleReviewLink,
        }),
      });
      if (res.ok) {
        setSentIds((prev) => new Set(prev).add(order.id));
      }
    } catch {
      // Silently fail
    }
    setSending(null);
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-6 text-navy-400 text-sm">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
        No recent completed orders
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {orders.map((o) => {
        const sent = sentIds.has(o.id);
        const isSending = sending === o.id;
        const hasEmail = !!o.customerEmail;
        const daysAgo = Math.floor((Date.now() - new Date(o.date).getTime()) / 86400000);

        return (
          <div
            key={o.id}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-cream-50 border border-cream-200"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-navy-800 truncate">{o.customerName}</div>
              <div className="text-xs text-navy-400 truncate">
                {o.photographerName} · {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
              </div>
            </div>
            {sent ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <Check className="h-3.5 w-3.5" /> Sent
              </span>
            ) : (
              <button
                onClick={() => sendReviewRequest(o)}
                disabled={!hasEmail || isSending}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {isSending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Mail className="h-3 w-3" />
                )}
                {hasEmail ? "Send" : "No email"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
