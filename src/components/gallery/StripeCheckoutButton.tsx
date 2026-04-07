"use client";
import { useState } from "react";

export default function StripeCheckoutButton({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then((r) => r.json());
    if (r.url) window.location.href = r.url;
    setBusy(false);
  }
  return (
    <button onClick={go} disabled={busy} className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-4 py-2 rounded-full font-semibold disabled:opacity-50">
      {busy ? "Redirecting..." : "Unlock all photos"}
    </button>
  );
}
