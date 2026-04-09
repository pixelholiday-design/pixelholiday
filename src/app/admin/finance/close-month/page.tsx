"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const TYPES = ["daily_cash", "bank_statement", "rent_receipt", "payroll", "petty_cash"];

export default function CloseMonthPage() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [locationId, setLocationId] = useState("");
  const [submitting, setSubmitting] = useState<string | null>(null);
  const month = new Date().toISOString().slice(0, 7);

  const load = async () => {
    if (!locationId) return;
    const r = await fetch(`/api/admin/proofs?locationId=${locationId}&month=${month}`);
    const j = await r.json();
    setProofs(j.proofs ?? []);
  };

  useEffect(() => {
    fetch("/api/admin/proofs?month=" + month)
      .then((r) => r.json())
      .then((j) => {
        setProofs(j.proofs ?? []);
        if (j.proofs?.[0]?.locationId) setLocationId(j.proofs[0].locationId);
      });
  }, []);

  const verify = async (type: string) => {
    setSubmitting(type);
    await fetch("/api/admin/proofs/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locationId, month, type, verified: true }),
    });
    setSubmitting(null);
    load();
  };

  const status = (t: string) => proofs.find((p) => p.type === t)?.status ?? "missing";
  const allVerified = TYPES.every((t) => status(t) === "verified");

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Finance</div>
        <h1 className="heading text-4xl mt-1">Close Month — {month}</h1>
        <p className="text-navy-400 mt-1">No proof, no pay. All 5 documents must be verified before month close.</p>
      </header>

      <div className="card p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="label-xs">Location ID</div>
          <input
            className="input flex-1"
            placeholder="Paste location ID…"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          />
          <button onClick={load} className="btn-ghost px-4 py-2 text-sm min-h-[44px]">
            Reload
          </button>
        </div>

        {allVerified && (
          <div className="flex items-center gap-2 mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
            <CheckCircle2 className="h-4 w-4" /> All proofs verified — month ready to close.
          </div>
        )}

        <ul className="space-y-2">
          {TYPES.map((t) => {
            const s = status(t);
            const verified = s === "verified";
            return (
              <li
                key={t}
                className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${
                  verified ? "border-green-200 bg-green-50" : "border-cream-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  {verified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-navy-300 shrink-0" />
                  )}
                  <span className="font-mono text-sm text-navy-700">{t}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold ${
                      verified ? "text-green-700" : "text-coral-600"
                    }`}
                  >
                    {s}
                  </span>
                  {!verified && (
                    <button
                      onClick={() => verify(t)}
                      disabled={submitting === t}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-700 text-white text-xs font-medium hover:bg-brand-800 disabled:opacity-50 min-h-[36px]"
                    >
                      {submitting === t ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      Mark verified
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
