"use client";
import { useEffect, useState } from "react";
import { ScanLine, User, KeyRound, Check, ArrowRight, RefreshCw, ShoppingCart, X, Sparkles } from "lucide-react";
import { cleanUrl } from "@/lib/cloudinary";

type Photo = { id: string; cloudinaryId: string | null; s3Key_highRes: string };
type Gallery = { id: string; magicLinkToken: string; photos: Photo[] };

export default function GalleryKiosk() {
  const [step, setStep] = useState<"id" | "browse" | "preview" | "checkout" | "done">("id");
  const [locationId, setLocationId] = useState("");
  const [active, setActive] = useState<Gallery | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [qrText, setQrText] = useState<string | null>(null);
  const [orderMsg, setOrderMsg] = useState<string | null>(null);

  // 5min cart timeout
  useEffect(() => {
    if (selected.size === 0) return;
    const t = setTimeout(() => {
      setSelected(new Set());
      setErr("Cart cleared after 5 minutes.");
    }, 5 * 60 * 1000);
    return () => clearTimeout(t);
  }, [selected]);

  // 30s auto-reset on done
  useEffect(() => {
    if (step !== "done") return;
    const t = setTimeout(reset, 30000);
    return () => clearTimeout(t);
  }, [step]);

  function reset() {
    setStep("id");
    setActive(null);
    setSelected(new Set());
    setQrText(null);
    setErr(null);
    setOrderMsg(null);
  }

  async function identify(method: "WRISTBAND" | "SELFIE" | "ROOM", value?: string) {
    setBusy(true); setErr(null);
    const body: any = { locationId: locationId || "_any_", method };
    if (method === "WRISTBAND") body.wristbandCode = value;
    if (method === "ROOM") body.roomNumber = value;
    if (method === "SELFIE") body.selfieData = "kiosk";
    const r = await fetch("/api/kiosk/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
    setBusy(false);
    if (!r.ok || !r.galleries?.length) {
      setErr(r.message || "No photos found.");
      return;
    }
    setActive(r.galleries[0]);
    setStep("browse");
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function payNow() {
    if (!active) return;
    setBusy(true);
    const r = await fetch("/api/kiosk/qr-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ galleryId: active.id, photoIds: Array.from(selected) }),
    }).then((r) => r.json());
    setBusy(false);
    if (r.ok) {
      setQrText(r.qrText);
      setOrderMsg("Scan the QR with your phone to pay. Photos arrive instantly.");
      setStep("done");
    }
  }

  async function orderAtCounter() {
    if (!active) return;
    setBusy(true);
    const r = await fetch("/api/kiosk/sale-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ galleryId: active.id, photoIds: Array.from(selected) }),
    }).then((r) => r.json());
    setBusy(false);
    if (r.ok) {
      setOrderMsg(`Order #${r.order.id.slice(0, 6).toUpperCase()} sent to the photographer. Please go to the counter.`);
      setQrText(null);
      setStep("done");
    }
  }

  // ── STEP id ──
  if (step === "id") {
    return (
      <div className="fixed inset-0 bg-navy-900 text-white flex flex-col items-center justify-center p-8 text-center">
        <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-3 inline-flex items-center gap-2">
          <Sparkles className="h-3 w-3" /> Customer Gallery
        </div>
        <h1 className="font-display text-6xl mb-4">Find your photos</h1>
        <p className="text-white/60 text-xl mb-12">Choose how you'd like to identify yourself.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          <IdCard
            icon={<ScanLine className="h-10 w-10" />}
            title="Scan wristband"
            sub="QR on your waterproof band"
            onClick={() => {
              const v = prompt("Wristband code (e.g. WRIST-TEST-001)");
              if (v) identify("WRISTBAND", v);
            }}
          />
          <IdCard
            icon={<User className="h-10 w-10" />}
            title="Take a selfie"
            sub="AI face match"
            onClick={() => identify("SELFIE")}
          />
          <IdCard
            icon={<KeyRound className="h-10 w-10" />}
            title="Room number"
            sub="Hotel guests"
            onClick={() => {
              const v = prompt("Room number");
              if (v) identify("ROOM", v);
            }}
          />
        </div>
        {err && <div className="mt-6 text-coral-400">{err}</div>}
        {busy && <div className="mt-6 text-white/60">Searching…</div>}
      </div>
    );
  }

  // ── STEP browse ──
  if ((step === "browse" || step === "preview") && active) {
    const previewPhoto = previewId ? active.photos.find((p) => p.id === previewId) : null;
    return (
      <div className="fixed inset-0 bg-navy-900 text-white flex flex-col">
        <header className="p-6 flex items-center justify-between border-b border-white/5">
          <div>
            <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-1">Browse</div>
            <h1 className="font-display text-2xl">Tap to preview · long-press to add</h1>
          </div>
          <button onClick={reset} className="btn-ghost text-white/70">
            <X className="h-4 w-4" /> Cancel
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {active.photos.map((p) => {
              const sel = selected.has(p.id);
              return (
                <div key={p.id} className="relative">
                  <button
                    onClick={() => setPreviewId(p.id)}
                    onDoubleClick={() => toggle(p.id)}
                    className={`relative w-full rounded-2xl overflow-hidden aspect-square min-h-[200px] transition ${
                      sel ? "ring-4 ring-coral-500" : "ring-1 ring-white/10"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cleanUrl(p.cloudinaryId || p.s3Key_highRes, 1200)} alt="" className="w-full h-full object-cover" />
                  </button>
                  <button
                    onClick={() => toggle(p.id)}
                    className={`absolute top-2 right-2 h-10 w-10 rounded-full backdrop-blur flex items-center justify-center shadow-lift ${
                      sel ? "bg-coral-500" : "bg-white/20"
                    }`}
                  >
                    {sel ? <Check className="h-5 w-5 text-white" strokeWidth={3} /> : <ShoppingCart className="h-4 w-4 text-white" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {previewPhoto && (
          <div className="fixed inset-0 bg-black/95 z-30 flex flex-col" onClick={() => setPreviewId(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cleanUrl(previewPhoto.cloudinaryId || previewPhoto.s3Key_highRes, 2400)}
              alt=""
              className="flex-1 object-contain w-full"
            />
            <div className="p-6 flex justify-center gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); toggle(previewPhoto.id); }}
                className={selected.has(previewPhoto.id) ? "btn-secondary" : "btn-primary"}
              >
                {selected.has(previewPhoto.id) ? "Remove from cart" : "Add to cart"}
              </button>
              <button onClick={() => setPreviewId(null)} className="btn-ghost text-white">
                Close
              </button>
            </div>
          </div>
        )}

        <footer className="p-6 border-t border-white/5 flex items-center gap-4">
          <ShoppingCart className="h-5 w-5 text-white/60" />
          <div className="text-white/70">
            {selected.size} of {active.photos.length} selected
          </div>
          <div className="flex-1" />
          <button
            disabled={!selected.size}
            onClick={() => setStep("checkout")}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-coral-500 to-gold-500 text-white font-bold px-8 py-4 disabled:opacity-30"
          >
            Checkout <ArrowRight className="h-5 w-5" />
          </button>
        </footer>
      </div>
    );
  }

  // ── STEP checkout ──
  if (step === "checkout" && active) {
    const total = selected.size === active.photos.length ? 99 : selected.size * 5;
    return (
      <div className="fixed inset-0 bg-navy-900 text-white flex flex-col items-center justify-center p-8 gap-8">
        <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold">Choose how to pay</div>
        <h1 className="font-display text-5xl">{selected.size} photos · €{total}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          <button onClick={payNow} disabled={busy} className="card !bg-white/5 !border-white/10 p-8 text-left hover:bg-white/10 transition">
            <Sparkles className="h-8 w-8 text-coral-400 mb-3" />
            <div className="font-display text-2xl text-white">Pay now</div>
            <p className="text-white/60 text-sm mt-2">Scan a QR with your phone to pay. Digital photos delivered instantly via WhatsApp.</p>
          </button>
          <button onClick={orderAtCounter} disabled={busy} className="card !bg-white/5 !border-white/10 p-8 text-left hover:bg-white/10 transition">
            <ShoppingCart className="h-8 w-8 text-gold-400 mb-3" />
            <div className="font-display text-2xl text-white">Order at counter</div>
            <p className="text-white/60 text-sm mt-2">Send your selection to the photographer. Pay by card or cash at the sale point.</p>
          </button>
        </div>
        <button onClick={() => setStep("browse")} className="btn-ghost text-white/70">
          ← Back to browse
        </button>
      </div>
    );
  }

  // ── STEP done ──
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white flex flex-col items-center justify-center p-8">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-coral-500/30 blur-3xl rounded-full animate-pulse" />
        <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-coral-400 to-gold-500 flex items-center justify-center shadow-lift">
          <Check className="h-16 w-16 text-white" strokeWidth={3} />
        </div>
      </div>
      <h1 className="font-display text-5xl mb-3">All set!</h1>
      <p className="text-xl text-white/60 mb-6">{orderMsg}</p>
      {qrText && (
        <div className="bg-white text-navy-900 rounded-2xl p-6 inline-flex flex-col items-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrText)}`}
            alt="QR"
            className="rounded-xl"
          />
        </div>
      )}
      <button onClick={reset} className="mt-8 inline-flex items-center gap-2 text-white/70 hover:text-white">
        <RefreshCw className="h-4 w-4" /> Start over
      </button>
      <p className="mt-2 text-xs text-white/40">Auto-reset in 30s</p>
    </div>
  );
}

function IdCard({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-coral-500/40 transition p-10 flex flex-col items-center text-center"
    >
      <div className="h-20 w-20 rounded-2xl bg-coral-500/15 text-coral-400 flex items-center justify-center mb-5">{icon}</div>
      <div className="font-display text-2xl mb-1 text-white">{title}</div>
      <div className="text-white/50">{sub}</div>
    </button>
  );
}
