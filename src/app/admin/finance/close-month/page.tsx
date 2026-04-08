"use client";
import { useEffect, useState } from "react";

const TYPES = ["daily_cash", "bank_statement", "rent_receipt", "payroll", "petty_cash"];

export default function CloseMonthPage() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [locationId, setLocationId] = useState("");
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
    await fetch("/api/admin/proofs/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locationId, month, type, verified: true }),
    });
    load();
  };

  const status = (t: string) => proofs.find((p) => p.type === t)?.status ?? "missing";

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Close Month — {month}</h1>
      <p className="text-sm text-gray-600 mb-6">No proof, no pay. All 5 must be verified.</p>
      <input
        className="w-full border p-2 mb-4 rounded"
        placeholder="locationId"
        value={locationId}
        onChange={(e) => setLocationId(e.target.value)}
      />
      <button onClick={load} className="bg-gray-200 px-3 py-1 rounded mb-4">Reload</button>
      <ul className="space-y-2">
        {TYPES.map((t) => {
          const s = status(t);
          return (
            <li key={t} className="flex justify-between items-center border p-3 rounded">
              <span className="font-mono">{t}</span>
              <span className={s === "verified" ? "text-green-700" : "text-red-700"}>{s}</span>
              <button
                onClick={() => verify(t)}
                className="bg-black text-white px-3 py-1 rounded text-sm"
              >
                Mark verified
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
