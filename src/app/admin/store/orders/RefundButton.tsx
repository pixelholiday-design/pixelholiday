"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

export default function RefundButton({
  orderId,
  amount,
  refunded,
  status,
}: {
  orderId: string;
  amount: number;
  refunded: number;
  status: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [partial, setPartial] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const remaining = Math.max(0, amount - (refunded || 0));
  const fullyRefunded = status === "REFUNDED" || remaining <= 0;

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const body: any = { orderId, reason };
      const partialNum = parseFloat(partial);
      if (partial && partialNum > 0) body.amount = partialNum;
      const r = await fetch("/api/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Refund failed");
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (fullyRefunded) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-navy-400">
        <RotateCcw className="h-3 w-3" /> Refunded
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-coral-50 text-coral-700 hover:bg-coral-100 transition"
      >
        <RotateCcw className="h-3 w-3" /> Refund
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-lift w-full max-w-md p-6 text-left" onClick={(e) => e.stopPropagation()}>
            <h3 className="heading text-lg mb-1">Issue refund</h3>
            <p className="text-xs text-navy-400 mb-4">
              Order €{amount.toFixed(2)} · Already refunded €{(refunded || 0).toFixed(2)} · Remaining €{remaining.toFixed(2)}
            </p>
            <label className="label-xs">Amount (leave blank for full refund)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={remaining}
              value={partial}
              onChange={(e) => setPartial(e.target.value)}
              placeholder={remaining.toFixed(2)}
              className="w-full mt-1 mb-3 rounded-lg border border-cream-300 px-3 py-2 text-sm"
            />
            <label className="label-xs">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full mt-1 rounded-lg border border-cream-300 px-3 py-2 text-sm"
              placeholder="Customer not satisfied / duplicate charge / ..."
            />
            {err && <div className="mt-3 text-xs text-coral-600">{err}</div>}
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={() => setOpen(false)} disabled={busy} className="btn-ghost">Cancel</button>
              <button onClick={submit} disabled={busy} className="btn-primary">
                {busy ? "Processing…" : "Issue refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
