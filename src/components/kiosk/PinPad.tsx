"use client";
import { useState } from "react";
import { Delete, Lock, Loader2 } from "lucide-react";

export default function PinPad({
  title = "Enter your PIN",
  onVerified,
}: {
  title?: string;
  onVerified: (user: { id: string; name: string; role: string }) => void;
}) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [attempts, setAttempts] = useState(0);

  function press(n: string) {
    if (locked || pin.length >= 4) return;
    setErr(null);
    const next = pin + n;
    setPin(next);
    if (next.length === 4) verify(next);
  }
  function back() {
    setPin((p) => p.slice(0, -1));
  }

  async function verify(code: string) {
    setBusy(true);
    const r = await fetch("/api/kiosk/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: code }),
    }).then((r) => r.json());
    setBusy(false);
    if (r.ok) {
      setAttempts(0);
      onVerified(r.user);
    } else {
      const a = attempts + 1;
      setAttempts(a);
      setPin("");
      setErr(r.error || "Wrong PIN");
      if (a >= 3) {
        setLocked(true);
        setErr("Locked for 5 minutes");
        setTimeout(() => { setLocked(false); setAttempts(0); setErr(null); }, 5 * 60 * 1000);
      }
    }
  }

  return (
    <div className="max-w-xs mx-auto text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-500/15 ring-1 ring-coral-500/30 mb-4">
        <Lock className="h-6 w-6 text-coral-300" />
      </div>
      <h2 className="font-display text-3xl text-white">{title}</h2>
      <div className="my-6 flex items-center justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full transition ${
              pin.length > i ? "bg-coral-500" : "bg-white/15"
            }`}
          />
        ))}
      </div>
      {err && <div className="text-coral-400 text-sm mb-3">{err}</div>}
      <div className="grid grid-cols-3 gap-3">
        {["1","2","3","4","5","6","7","8","9"].map((n) => (
          <button
            key={n}
            onClick={() => press(n)}
            disabled={locked || busy}
            className="h-16 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-2xl font-semibold transition disabled:opacity-30"
          >
            {n}
          </button>
        ))}
        <div />
        <button
          onClick={() => press("0")}
          disabled={locked || busy}
          className="h-16 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-2xl font-semibold transition disabled:opacity-30"
        >
          0
        </button>
        <button
          onClick={back}
          disabled={locked || busy || pin.length === 0}
          className="h-16 rounded-2xl bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition disabled:opacity-30"
        >
          <Delete className="h-5 w-5" />
        </button>
      </div>
      {busy && <div className="mt-4 text-white/60 text-sm flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</div>}
    </div>
  );
}
