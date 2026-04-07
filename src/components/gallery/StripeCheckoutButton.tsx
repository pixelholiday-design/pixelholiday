"use client";
import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";

export default function StripeCheckoutButton({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then((r) => r.json());
    if (r.url) window.location.href = r.url;
    setBusy(false);
  }
  return (
    <button
      onClick={go}
      disabled={busy}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-coral-500 to-gold-500 px-5 py-3 text-sm sm:text-base font-semibold text-white shadow-lift hover:brightness-105 active:scale-[0.98] disabled:opacity-60 whitespace-nowrap"
    >
      {busy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Redirecting…
        </>
      ) : (
        <>
          Unlock — €49 <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
