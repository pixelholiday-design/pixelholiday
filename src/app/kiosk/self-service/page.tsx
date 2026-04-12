"use client";
import { useEffect, useMemo, useState } from "react";
import { ScanLine, User, KeyRound, Check, ArrowRight, RefreshCw, Sparkles, ChevronLeft, ChevronRight, Printer, X, Aperture } from "lucide-react";
import { cleanUrl, photoRef } from "@/lib/cloudinary";
import { loadKioskSettings, localApiBase } from "@/lib/kiosk-mode";
import ConnectionStatus from "@/components/kiosk/ConnectionStatus";

type Photo = { id: string; cloudinaryId: string | null; s3Key_highRes: string };
type Gallery = { id: string; magicLinkToken: string; photos: Photo[] };

const FULL = 99;
const SINGLE = 15;

export default function SelfServiceKiosk() {
  const settings = useMemo(() => loadKioskSettings(), []);
  const apiBase = useMemo(() => localApiBase(settings), [settings]);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [locationId, setLocationId] = useState(settings?.locationId || "");
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [activeGallery, setActiveGallery] = useState<Gallery | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [qrText, setQrText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [inputModal, setInputModal] = useState<{ type: string; label: string; placeholder: string } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (locationId) return;
    fetch(apiBase + "/api/admin/staff")
      .then((r) => r.json())
      .then((d) => {
        const loc = (d.staff || []).find((s: any) => s.location)?.location;
        if (loc) setLocationId(loc.id);
      })
      .catch(() => {});
  }, [apiBase, locationId]);

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
    const r = await fetch(apiBase + "/api/kiosk/identify", {
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
    const r = await fetch(apiBase + "/api/kiosk/qr-payment", {
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
      <div className="fixed inset-0 kiosk-mesh text-white flex flex-col">
        <div className="absolute top-4 right-4 z-10">
          <ConnectionStatus baseUrl={apiBase} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="kiosk-badge mb-4 anim-slide-up" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>
            <Aperture className="h-3 w-3" /> Self-service
          </div>
          <h1 className="text-6xl font-bold tracking-tight mb-4 anim-slide-up" style={{ animationDelay: "50ms" }}>Find your photos</h1>
          <p className="text-white/40 text-xl mb-12 anim-slide-up" style={{ animationDelay: "100ms" }}>Choose how you'd like to identify yourself.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full stagger">
            <IdCard
              icon={<ScanLine className="h-9 w-9" />}
              title="Scan wristband"
              sub="QR on your waterproof band"
              onClick={() => {
                setInputValue("");
                setInputModal({ type: "WRISTBAND", label: "Enter your wristband code", placeholder: "QR-WRIST-..." });
              }}
            />
            <IdCard
              icon={<User className="h-9 w-9" />}
              title="Take a selfie"
              sub="AI face match"
              onClick={() => identify("SELFIE")}
            />
            <IdCard
              icon={<KeyRound className="h-9 w-9" />}
              title="Room number"
              sub="Hotel guests"
              onClick={() => {
                setInputValue("");
                setInputModal({ type: "ROOM", label: "Enter your room number", placeholder: "e.g. 214" });
              }}
            />
          </div>

          {err && <div className="mt-8 text-red-400 text-base anim-shake">{err}</div>}
          {busy && <div className="mt-8 text-white/40 anim-pulse-soft">Searching...</div>}

          {/* Input modal */}
          {inputModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
              <div className="kiosk-card p-8 w-full max-w-sm flex flex-col gap-6 anim-scale-in">
                <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-center text-indigo-400">{inputModal.label}</div>
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputModal.placeholder}
                  className="w-full min-h-[56px] px-5 py-4 rounded-xl text-white text-center text-2xl placeholder-white/20 tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
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
                    className="kiosk-btn kiosk-btn-ghost flex-1 min-h-[48px]"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!inputValue.trim()}
                    onClick={() => {
                      identify(inputModal.type as "WRISTBAND" | "ROOM", inputValue.trim());
                      setInputModal(null);
                    }}
                    className="kiosk-btn kiosk-btn-primary flex-1 min-h-[48px]"
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
      <div className="fixed inset-0 text-white flex flex-col" style={{ background: "#050a12" }}>
        <header className="p-6 lg:p-8 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div className="kiosk-badge mb-2" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>Step 2 of 3</div>
            <h1 className="text-2xl font-bold tracking-tight">Pick your favorites</h1>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-white/30 uppercase tracking-[0.12em] font-semibold">Selected</div>
            <div className="text-3xl font-bold tabular-nums mt-1">
              {selected.size}
              <span className="text-white/20 text-xl"> / {activeGallery.photos.length}</span>
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
                    className="relative w-full rounded-2xl overflow-hidden transition-all duration-200 aspect-square min-h-[200px]"
                    style={{
                      border: isActive ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.06)",
                      transform: isActive ? "scale(0.98)" : "scale(1)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cleanUrl(photoRef(p), 1600)} alt="" className="w-full h-full object-cover" />
                    {isActive && (
                      <div className="absolute top-3 right-3 h-10 w-10 rounded-full flex items-center justify-center" style={{ background: "#6366f1" }}>
                        <Check className="h-5 w-5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => toggle(p.id)}
                    className="absolute bottom-2 right-2 h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
                    style={{
                      background: isActive ? "#6366f1" : "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      color: "white",
                    }}
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
            <div className="fixed inset-0 z-50 flex flex-col anim-fade-in" style={{ background: "rgba(0,0,0,0.95)" }} onClick={() => setPreviewPhoto(null)}>
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
                  className="h-12 w-12 rounded-full flex items-center justify-center transition disabled:opacity-20"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={() => { toggle(previewPhoto.id); setPreviewPhoto(null); }}
                  className="kiosk-btn px-8 py-3 font-bold text-white"
                  style={{
                    background: isSelected ? "rgba(255,255,255,0.1)" : "#6366f1",
                    border: isSelected ? "1px solid rgba(255,255,255,0.15)" : "none",
                  }}
                >
                  {isSelected ? "Remove from selection" : "Select this photo"}
                </button>
                <button
                  disabled={idx === photos.length - 1}
                  onClick={() => setPreviewPhoto(photos[idx + 1])}
                  className="h-12 w-12 rounded-full flex items-center justify-center transition disabled:opacity-20"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="h-12 w-12 rounded-full flex items-center justify-center transition ml-2"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
              <div className="pb-4 text-center text-white/25 text-xs tabular-nums">{idx + 1} / {photos.length}</div>
            </div>
          );
        })()}

        <footer className="p-6 lg:p-8 flex items-center gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={reset} className="kiosk-btn kiosk-btn-ghost">
            Cancel
          </button>
          <div className="flex-1" />
          <div className="text-right">
            <div className="text-[11px] text-white/30 uppercase tracking-[0.12em] font-semibold">Total</div>
            <div className="text-4xl font-bold text-indigo-400 tabular-nums">&euro;{total}</div>
          </div>
          <button
            disabled={!selected.size || busy}
            onClick={() => setStep(3)}
            className="kiosk-btn kiosk-btn-primary px-10 py-5 text-lg"
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
      <div className="fixed inset-0 kiosk-mesh text-white flex flex-col items-center justify-center p-8">
        <div className="kiosk-badge mb-4 anim-slide-up" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>Step 3 of 3</div>
        <h1 className="text-5xl font-bold tracking-tight mb-4 anim-slide-up" style={{ animationDelay: "50ms" }}>Confirm & pay</h1>
        <div className="text-6xl font-bold text-indigo-400 mb-3 tabular-nums anim-slide-up" style={{ animationDelay: "100ms" }}>&euro;{total}</div>
        <p className="text-white/40 mb-12 anim-slide-up" style={{ animationDelay: "150ms" }}>{selected.size} photos &middot; ready to send to your phone</p>
        <button onClick={checkout} disabled={busy} className="kiosk-btn kiosk-btn-primary px-12 py-6 text-xl anim-slide-up anim-glow" style={{ animationDelay: "200ms" }}>
          {busy ? "Generating QR..." : "Generate payment QR"} <ArrowRight className="h-5 w-5" />
        </button>
        <button onClick={() => setStep(2)} className="mt-6 text-white/40 hover:text-white/60 transition text-sm">
          &larr; Back to photos
        </button>
      </div>
    );
  }

  // ── STEP 4 — Success ──────────────────────
  if (step === 4) {
    return (
      <div className="fixed inset-0 kiosk-mesh-success text-white flex flex-col items-center justify-center p-8">
        <div className="relative mb-8 anim-scale-in">
          <div className="absolute inset-0 blur-3xl rounded-full" style={{ background: "rgba(34, 197, 94, 0.2)" }} />
          <div className="relative h-28 w-28 rounded-full flex items-center justify-center anim-glow" style={{ background: "#22c55e" }}>
            <Check className="h-14 w-14 text-white" strokeWidth={3} />
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-3 anim-slide-up" style={{ animationDelay: "100ms" }}>Photos sent to your phone!</h1>
        <p className="text-lg text-white/40 mb-8 anim-slide-up" style={{ animationDelay: "150ms" }}>Check WhatsApp for your secure download link.</p>
        {qrText && (
          <div className="bg-white text-gray-900 rounded-2xl p-6 inline-flex flex-col items-center anim-scale-in" style={{ animationDelay: "200ms" }}>
            <div className="text-[11px] uppercase tracking-[0.12em] text-gray-400 font-semibold mb-3">Scan to open gallery</div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrText)}`}
              alt="QR"
              className="rounded-xl"
            />
            <a href={qrText} className="text-xs text-indigo-600 underline mt-3 break-all max-w-[240px]" target="_blank" rel="noreferrer">
              {qrText}
            </a>
          </div>
        )}
        <button
          onClick={() => window.print()}
          className="mt-6 kiosk-btn kiosk-btn-ghost"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Printer className="h-4 w-4" /> Print photos
        </button>
        <button onClick={reset} className="mt-4 inline-flex items-center gap-2 text-white/40 hover:text-white/60 transition text-sm">
          <RefreshCw className="h-3.5 w-3.5" /> Start over
        </button>
        <p className="mt-2 text-[11px] text-white/20">Auto-reset in 30s</p>
      </div>
    );
  }

  return null;
}

function IdCard({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="kiosk-card p-10 flex flex-col items-center text-center transition-all duration-200 hover:border-indigo-500/30 anim-slide-up"
    >
      <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 text-indigo-400" style={{ background: "rgba(99, 102, 241, 0.1)" }}>{icon}</div>
      <div className="text-2xl font-bold tracking-tight mb-1 text-white">{title}</div>
      <div className="text-white/35 text-sm">{sub}</div>
    </button>
  );
}
