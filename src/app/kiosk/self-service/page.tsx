"use client";
import { useEffect, useState } from "react";
import { ScanLine, User, KeyRound, Check, Heart, ArrowRight, RefreshCw, Sparkles, ChevronLeft, ChevronRight, Printer, X } from "lucide-react";
import { cleanUrl, photoRef } from "@/lib/cloudinary";

type Photo = { id: string; cloudinaryId: string | null; s3Key_highRes: string };
type Gallery = { id: string; magicLinkToken: string; photos: Photo[] };

const FULL = 99;
const SINGLE = 15;

export default function SelfServiceKiosk() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [locationId, setLocationId] = useState("");
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [activeGallery, setActiveGallery] = useState<Gallery | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [qrText, setQrText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [inputModal, setInputModal] = useState<{ type: string; label: string; placeholder: string } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  // Pull a default location id once.
  useEffect(() => {
    fetch("/api/admin/staff")
      .then((r) => r.json())
      .then((d) => {
        const loc = (d.staff || []).find((s: any) => s.location)?.location;
        if (loc) setLocationId(loc.id);
      })
      .catch(() => {});
  }, []);

  // Auto-reset to step 1 after success
  useEffect(() => {
    if (step !== 4) return;
    const t = setTimeout(() => reset(), 30000);
    return () => clearTimeout(t);
  }, [step]);

  function reset() {
    setStep(1);
    setGalleries([]);
    setActiveGallery(null);
    setSelected(new Set());
    setQrText(null);
    setErr(null);
  }

  async function identify(method: "WRISTBAND" | "SELFIE" | "ROOM", value?: string) {
    setBusy(true);
    setErr(null);
    const body: any = { locationId, method };
    if (method === "WRISTBAND") body.wristbandCode = value;
    if (method === "ROOM") body.roomNumber = value;
    if (method === "SELFIE") body.selfieData = "mock";
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
    setGalleries(r.galleries);
    setActiveGallery(r.galleries[0]);
    setStep(2);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function checkout() {
    if (!activeGallery) return;
    setBusy(true);
    const r = await fetch("/api/kiosk/qr-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ galleryId: activeGallery.id, photoIds: Array.from(selected) }),
    }).then((r) => r.json());
    setBusy(false);
    if (r.ok) {
      setQrText(r.qrText);
      setStep(4);
    }
  }

  const total = activeGallery
    ? selected.size === activeGallery.photos.length
      ? FULL
      : selected.size * SINGLE
    : 0;

  // ── STEP 1 — Identify ──────────────────────
  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-navy-900 text-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-3 inline-flex items-center gap-2">
            <Sparkles className="h-3 w-3" /> Pixelvo self-service
          </div>
          <h1 className="font-display text-6xl mb-4">Find your photos</h1>
          <p className="text-white/60 text-xl mb-12">Choose how you'd like to identify yourself.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
            <IdCard
              icon={<ScanLine className="h-10 w-10" />}
              title="Scan wristband"
              sub="QR on your waterproof band"
              onClick={() => {
                setInputValue("");
                setInputModal({ type: "WRISTBAND", label: "Enter your wristband code", placeholder: "QR-WRIST-..." });
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
                setInputValue("");
                setInputModal({ type: "ROOM", label: "Enter your room number", placeholder: "e.g. 214" });
              }}
            />
          </div>

          {err && <div className="mt-8 text-coral-400 text-lg">{err}</div>}
          {busy && <div className="mt-8 text-white/60">Searching…</div>}

          {/* Input modal */}
          {inputModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="bg-navy-800 border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-lift flex flex-col gap-6">
                <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold text-center">{inputModal.label}</div>
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputModal.placeholder}
                  className="w-full min-h-[56px] px-5 py-4 rounded-xl bg-white/10 text-white text-center text-2xl placeholder-white/30 tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputValue.trim()) {
                      identify(inputModal.type as "WRISTBAND" | "ROOM", inputValue.trim());
                      setInputModal(null);
                    }
                    if (e.key === "Escape") setInputModal(null);
                  }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setInputModal(null)}
                    className="flex-1 min-h-[48px] rounded-xl bg-white/10 text-white/70 font-semibold hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!inputValue.trim()}
                    onClick={() => {
                      identify(inputModal.type as "WRISTBAND" | "ROOM", inputValue.trim());
                      setInputModal(null);
                    }}
                    className="flex-1 min-h-[48px] rounded-xl bg-gradient-to-r from-coral-500 to-gold-500 text-white font-bold disabled:opacity-40 transition hover:scale-105"
                  >
                    Find my photos
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── STEP 2 — Photo selection ───────────────
  if (step === 2 && activeGallery) {
    return (
      <div className="fixed inset-0 bg-navy-900 text-white flex flex-col">
        <header className="p-6 lg:p-8 flex items-center justify-between border-b border-white/5">
          <div>
            <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-1">Step 2 of 3</div>
            <h1 className="font-display text-3xl">Pick your favorites</h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/50">Selected</div>
            <div className="font-display text-3xl">
              {selected.size}
              <span className="text-white/30 text-2xl"> / {activeGallery.photos.length}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeGallery.photos.map((p) => {
              const isActive = selected.has(p.id);
              return (
                <div key={p.id} className="relative">
                  <button
                    onClick={() => setPreviewPhoto(p)}
                    className={`relative w-full rounded-2xl overflow-hidden transition aspect-square min-h-[200px] ${
                      isActive ? "ring-4 ring-coral-500 scale-[0.98] shadow-lift" : "ring-1 ring-white/10"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cleanUrl(photoRef(p), 1600)} alt="" className="w-full h-full object-cover" />
                    {isActive && (
                      <div className="absolute top-3 right-3 h-12 w-12 rounded-full bg-coral-500 flex items-center justify-center shadow-lift">
                        <Check className="h-6 w-6 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => toggle(p.id)}
                    className={`absolute bottom-2 right-2 h-9 w-9 rounded-full backdrop-blur flex items-center justify-center shadow-lift text-xs font-bold transition ${
                      isActive ? "bg-coral-500 text-white" : "bg-white/20 text-white"
                    }`}
                    title={isActive ? "Remove" : "Select"}
                  >
                    {isActive ? <Check className="h-4 w-4" strokeWidth={3} /> : "+"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lightbox */}
        {previewPhoto && (() => {
          const photos = activeGallery.photos;
          const idx = photos.findIndex((p) => p.id === previewPhoto.id);
          const isSelected = selected.has(previewPhoto.id);
          return (
            <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={() => setPreviewPhoto(null)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cleanUrl(photoRef(previewPhoto), 2400)}
                alt=""
                className="flex-1 object-contain w-full"
              />
              <div className="p-6 flex items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
                <button
                  disabled={idx === 0}
                  onClick={() => setPreviewPhoto(photos[idx - 1])}
                  className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition disabled:opacity-30"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={() => { toggle(previewPhoto.id); setPreviewPhoto(null); }}
                  className={`inline-flex items-center gap-2 rounded-xl px-8 py-3 font-bold text-white transition ${
                    isSelected
                      ? "bg-white/20 border border-white/30 hover:bg-white/30"
                      : "bg-gradient-to-r from-coral-500 to-gold-500 hover:scale-105"
                  }`}
                >
                  {isSelected ? "Remove from selection" : "Select this photo"}
                </button>
                <button
                  disabled={idx === photos.length - 1}
                  onClick={() => setPreviewPhoto(photos[idx + 1])}
                  className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition disabled:opacity-30"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition ml-2"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
              <div className="pb-4 text-center text-white/40 text-xs">{idx + 1} / {photos.length}</div>
            </div>
          );
        })()}

        <footer className="p-6 lg:p-8 border-t border-white/5 flex items-center gap-4">
          <button onClick={reset} className="px-5 py-3 rounded-xl bg-white/10 text-white/80 font-semibold">
            Cancel
          </button>
          <div className="flex-1" />
          <div className="text-right">
            <div className="text-white/50 text-xs uppercase tracking-widest">Total</div>
            <div className="font-display text-4xl text-gold-400">€{total}</div>
          </div>
          <button
            disabled={!selected.size || busy}
            onClick={() => setStep(3)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-coral-500 to-gold-500 text-white font-bold px-10 py-5 text-lg shadow-lift disabled:opacity-30"
          >
            Continue <ArrowRight className="h-5 w-5" />
          </button>
        </footer>
      </div>
    );
  }

  // ── STEP 3 — Confirm + pay ─────────────────
  if (step === 3 && activeGallery) {
    return (
      <div className="fixed inset-0 bg-navy-900 text-white flex flex-col items-center justify-center p-8">
        <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-3">Step 3 of 3</div>
        <h1 className="font-display text-5xl mb-4">Confirm & pay</h1>
        <div className="font-display text-6xl text-gold-400 mb-2">€{total}</div>
        <p className="text-white/60 mb-12">{selected.size} photos · ready to send to your phone</p>
        <button onClick={checkout} disabled={busy} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-coral-500 to-gold-500 text-white font-bold px-12 py-6 text-xl shadow-lift">
          {busy ? "Generating QR…" : "Generate payment QR"} <ArrowRight className="h-5 w-5" />
        </button>
        <button onClick={() => setStep(2)} className="mt-6 text-white/60 underline">
          ← Back to photos
        </button>
      </div>
    );
  }

  // ── STEP 4 — Success ──────────────────────
  if (step === 4) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white flex flex-col items-center justify-center p-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-coral-500/30 blur-3xl rounded-full animate-pulse" />
          <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-coral-400 to-gold-500 flex items-center justify-center shadow-lift">
            <Check className="h-16 w-16 text-white" strokeWidth={3} />
          </div>
        </div>
        <h1 className="font-display text-5xl mb-3">Photos sent to your phone!</h1>
        <p className="text-xl text-white/60 mb-8">Check WhatsApp for your secure download link.</p>
        {qrText && (
          <div className="bg-white text-navy-900 rounded-2xl p-6 inline-flex flex-col items-center">
            <div className="text-xs uppercase tracking-widest text-navy-400 mb-3">Scan to open gallery</div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrText)}`}
              alt="QR"
              className="rounded-xl"
            />
            <a href={qrText} className="text-xs text-coral-600 underline mt-3 break-all max-w-[240px]" target="_blank" rel="noreferrer">
              {qrText}
            </a>
          </div>
        )}
        <button
          onClick={() => window.print()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/20 text-white/70 px-6 py-3 font-semibold hover:border-white/40 hover:text-white transition"
        >
          <Printer className="h-4 w-4" /> Print photos
        </button>
        <button onClick={reset} className="mt-4 inline-flex items-center gap-2 text-white/70 hover:text-white">
          <RefreshCw className="h-4 w-4" /> Start over
        </button>
        <p className="mt-2 text-xs text-white/40">Auto-reset in 30s</p>
      </div>
    );
  }

  return null;
}

function IdCard({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-coral-500/40 transition p-10 flex flex-col items-center text-center"
    >
      <div className="h-20 w-20 rounded-2xl bg-coral-500/15 text-coral-400 flex items-center justify-center mb-5">{icon}</div>
      <div className="font-display text-2xl mb-1">{title}</div>
      <div className="text-white/50">{sub}</div>
    </button>
  );
}
