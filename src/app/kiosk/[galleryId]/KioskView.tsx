"use client";
import { useState } from "react";
import { Check, CreditCard, Banknote, Loader2, Sparkles } from "lucide-react";
import { cleanUrl, photoRef } from "@/lib/cloudinary";

type Photo = { id: string; s3Key_highRes: string; cloudinaryId: string | null; isFavorited: boolean };
type Gallery = { id: string; photos: Photo[]; customer: { name: string | null } };

const SINGLE = 15;
const FULL = 99;

export default function KioskView({ gallery }: { gallery: Gallery }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [method, setMethod] = useState<"STRIPE_TERMINAL" | "CASH">("STRIPE_TERMINAL");
  const [pin, setPin] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const isFull = selected.size === gallery.photos.length;
  const total = selected.size === 0 ? 0 : isFull ? FULL : selected.size * SINGLE;

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function selectAll() {
    setSelected(new Set(gallery.photos.map((p) => p.id)));
  }

  async function complete() {
    setBusy(true);
    const r = await fetch("/api/kiosk/sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        galleryId: gallery.id,
        photoIds: Array.from(selected),
        paymentMethod: method,
        cashPin: method === "CASH" ? pin : undefined,
      }),
    }).then((r) => r.json());
    setBusy(false);
    if (r.ok) setDone(true);
  }

  if (done) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex flex-col items-center justify-center text-white">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-coral-500/30 blur-3xl rounded-full animate-pulse" />
          <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-coral-400 to-gold-500 flex items-center justify-center shadow-lift">
            <Check className="h-16 w-16 text-white" strokeWidth={3} />
          </div>
        </div>
        <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-3 w-3" /> Sale complete
        </div>
        <h1 className="font-display text-6xl mb-3">Enjoy your memories</h1>
        <p className="text-xl text-white/60">{selected.size} photos unlocked on the customer's phone.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-navy-900 text-white flex flex-col">
      <header className="sticky top-0 bg-navy-900/95 backdrop-blur p-6 lg:p-8 z-10 border-b border-white/5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-gold-400 text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> PixelHoliday Studio
            </div>
            <h1 className="font-display text-4xl">Welcome, {gallery.customer.name || "Guest"}</h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/50">Selected</div>
            <div className="font-display text-4xl text-white">
              {selected.size}
              <span className="text-white/30 text-2xl"> / {gallery.photos.length}</span>
            </div>
            <button onClick={selectAll} className="text-xs text-coral-400 hover:text-coral-300 mt-1">
              Select all
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.photos.map((p) => {
            const active = selected.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`relative rounded-2xl overflow-hidden transition duration-200 aspect-square min-h-[200px] ${
                  active
                    ? "ring-4 ring-coral-500 scale-[0.98] shadow-lift"
                    : "ring-1 ring-white/10 hover:ring-white/30"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cleanUrl(photoRef(p), 1600)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {active && (
                  <>
                    <div className="absolute inset-0 bg-coral-500/15" />
                    <div className="absolute top-3 right-3 h-10 w-10 rounded-full bg-coral-500 flex items-center justify-center shadow-lift">
                      <Check className="h-5 w-5 text-white" strokeWidth={3} />
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <footer className="sticky bottom-0 bg-navy-900/95 backdrop-blur border-t border-white/5 p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMethod("STRIPE_TERMINAL")}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${
                method === "STRIPE_TERMINAL"
                  ? "bg-white text-navy-900 shadow-lift"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <CreditCard className="h-4 w-4" /> Card
            </button>
            <button
              onClick={() => setMethod("CASH")}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${
                method === "CASH"
                  ? "bg-white text-navy-900 shadow-lift"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <Banknote className="h-4 w-4" /> Cash
            </button>
          </div>

          {method === "CASH" && (
            <input
              type="password"
              placeholder="Staff PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="bg-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 border border-white/10 focus:border-coral-400 focus:outline-none"
            />
          )}

          <div className="flex-1" />

          <div className="text-right">
            <div className="text-white/50 text-xs uppercase tracking-widest">Total</div>
            <div className="font-display text-4xl text-gold-400">€{total}</div>
          </div>

          <button
            disabled={!selected.size || busy || (method === "CASH" && !pin)}
            onClick={complete}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-coral-500 to-gold-500 text-white font-bold px-10 py-5 text-lg shadow-lift hover:brightness-105 disabled:opacity-30 disabled:pointer-events-none"
          >
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Processing…
              </>
            ) : (
              <>
                Complete sale <Check className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
