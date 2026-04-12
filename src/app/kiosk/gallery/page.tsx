"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScanLine, User, KeyRound, Check, ArrowRight, RefreshCw, ShoppingCart, X, Sparkles, Tag, Wifi, Database, Printer, Image, CreditCard, Aperture } from "lucide-react";
import { cleanUrl, photoRef } from "@/lib/cloudinary";
import { loadKioskSettings, localApiBase } from "@/lib/kiosk-mode";
import ConnectionStatus from "@/components/kiosk/ConnectionStatus";
import QRScanner from "@/components/mobile/QRScanner";
import SelfieCamera from "@/components/kiosk/SelfieCamera";
import {
  cacheGalleryPhotos,
  getCachedPhotoUrl,
} from "@/lib/kiosk-photo-cache";

type Photo = { id: string; cloudinaryId: string | null; s3Key_highRes: string };
type Gallery = { id: string; magicLinkToken: string; photos: Photo[] };

export default function GalleryKiosk() {
  const settings = useMemo(() => loadKioskSettings(), []);
  const apiBase = useMemo(() => localApiBase(settings), [settings]);
  const [step, setStep] = useState<"id" | "browse" | "preview" | "checkout" | "done">("id");
  const [locationId, setLocationId] = useState(settings?.locationId || "");
  const [active, setActive] = useState<Gallery | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [qrText, setQrText] = useState<string | null>(null);
  const [orderMsg, setOrderMsg] = useState<string | null>(null);
  const [wristbandInput, setWristbandInput] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [inputModal, setInputModal] = useState<{ type: string; label: string; placeholder: string } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showSelfieCamera, setShowSelfieCamera] = useState(false);
  const locationType = settings?.locationType || "WATER_PARK";

  // Photo cache state
  const [cachedUrls, setCachedUrls] = useState<Record<string, string>>({});
  const [cacheProgress, setCacheProgress] = useState<{ done: number; total: number } | null>(null);
  const cacheAbortRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    cacheAbortRef.current = false;
    const autoCache = loadKioskSettings()?.autoCache !== false;
    if (!autoCache) return;
    const photos = active.photos.map((p) => ({
      id: p.id,
      url: cleanUrl(photoRef(p), 1200),
    }));
    setCacheProgress({ done: 0, total: photos.length });
    cacheGalleryPhotos(active.id, photos, (done, total) => {
      if (!cacheAbortRef.current) setCacheProgress({ done, total });
    }).then(async () => {
      if (cacheAbortRef.current) return;
      const urls: Record<string, string> = {};
      await Promise.all(
        active.photos.map(async (p) => {
          const blobUrl = await getCachedPhotoUrl(p.id);
          if (blobUrl) urls[p.id] = blobUrl;
        })
      );
      if (!cacheAbortRef.current) setCachedUrls(urls);
    });
    return () => {
      cacheAbortRef.current = true;
      setCacheProgress(null);
    };
  }, [active]);

  useEffect(() => {
    if (selected.size === 0) return;
    const t = setTimeout(() => {
      setSelected(new Set());
      setErr("Cart cleared after 5 minutes.");
    }, 5 * 60 * 1000);
    return () => clearTimeout(t);
  }, [selected]);

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
    setCachedUrls({});
    setCacheProgress(null);
  }

  async function identify(method: "WRISTBAND" | "SELFIE" | "ROOM" | "NFC", value?: string) {
    setBusy(true); setErr(null);
    const body: any = { locationId: locationId || "_any_", method };
    if (method === "WRISTBAND") body.wristbandCode = value;
    if (method === "ROOM") body.roomNumber = value;
    if (method === "NFC") body.nfcTag = value;
    if (method === "SELFIE") body.selfieData = "kiosk";
    const r = await fetch(`${apiBase}/api/kiosk/identify`, {
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
    const r = await fetch(`${apiBase}/api/kiosk/qr-payment`, {
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
    const r = await fetch(`${apiBase}/api/local/order`, {
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

  // ── Selfie Camera Modal ──
  if (showSelfieCamera) {
    return (
      <div className="fixed inset-0 z-50" style={{ background: "#050a12" }}>
        <SelfieCamera
          locationId={locationId || "_any_"}
          onResults={(results) => {
            setShowSelfieCamera(false);
            if (results.length > 0) {
              const photoMap = results.map((r) => ({
                id: r.photoId,
                cloudinaryId: null,
                s3Key_highRes: r.thumbnailUrl,
              }));
              setActive({
                id: results[0].galleryId,
                magicLinkToken: "",
                photos: photoMap,
              });
              setStep("browse");
            }
          }}
          onClose={() => setShowSelfieCamera(false)}
        />
      </div>
    );
  }

  // ── STEP id ──
  if (step === "id") {
    return (
      <div className="fixed inset-0 kiosk-mesh text-white flex flex-col items-center justify-center p-8 text-center">
        <ConnectionStatus baseUrl={apiBase} />
        <div className="kiosk-badge mb-4 anim-slide-up" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>
          <Aperture className="h-3 w-3" /> Customer Gallery
        </div>
        <h1 className="text-6xl font-bold tracking-tight mb-4 anim-slide-up" style={{ animationDelay: "50ms" }}>Find your photos</h1>
        <p className="text-white/40 text-xl mb-12 anim-slide-up" style={{ animationDelay: "100ms" }}>Choose how you'd like to identify yourself.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-5xl w-full stagger">
          {/* QR/Wristband scan */}
          {locationType !== "HOTEL" && (
            <div className="kiosk-card p-6 flex flex-col items-center text-center anim-slide-up">
              <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 text-indigo-400" style={{ background: "rgba(99, 102, 241, 0.1)" }}>
                <ScanLine className="h-9 w-9" />
              </div>
              <div className="text-2xl font-bold tracking-tight mb-1 text-white">Scan QR code</div>
              <div className="text-white/35 text-sm mb-4">Wristband or booking code</div>
              {showQrScanner ? (
                <>
                  <QRScanner
                    onResult={(code) => {
                      setShowQrScanner(false);
                      identify("WRISTBAND", code);
                    }}
                  />
                  <button onClick={() => setShowQrScanner(false)} className="mt-3 text-white/30 text-xs hover:text-white/50">
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowQrScanner(true)}
                  className="kiosk-btn kiosk-btn-primary w-full min-h-[48px]"
                >
                  Open Scanner
                </button>
              )}
            </div>
          )}

          {/* Selfie */}
          <IdCard
            icon={<User className="h-9 w-9" />}
            title="Take a selfie"
            sub="AI face match"
            onClick={() => setShowSelfieCamera(true)}
          />

          {/* Room number — HOTEL only */}
          {locationType === "HOTEL" && (
            <IdCard
              icon={<KeyRound className="h-9 w-9" />}
              title="Room number"
              sub="Hotel guests"
              onClick={() => {
                setInputValue("");
                setInputModal({ type: "ROOM", label: "Enter your room number", placeholder: "e.g. 214" });
              }}
            />
          )}

          {/* NFC — WATER_PARK / ATTRACTION */}
          {(locationType === "WATER_PARK" || locationType === "ATTRACTION") && (
            <IdCard
              icon={<Wifi className="h-9 w-9" />}
              title="Tap NFC tag"
              sub="Touch your NFC wristband or card"
              onClick={() => {
                setInputValue("");
                setInputModal({ type: "NFC", label: "Tap your NFC tag", placeholder: "Tag ID" });
              }}
            />
          )}

          {/* Manual code entry */}
          <div className="kiosk-card p-6 flex flex-col items-center text-center anim-slide-up">
            <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 text-violet-400" style={{ background: "rgba(139, 92, 246, 0.1)" }}>
              <Tag className="h-9 w-9" />
            </div>
            <div className="text-2xl font-bold tracking-tight mb-1 text-white">
              {locationType === "HOTEL" ? "Enter booking code" : "Enter wristband code"}
            </div>
            <div className="text-white/35 text-sm mb-4">
              {locationType === "HOTEL" ? "Type your booking reference" : "Type the code on your band"}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const v = wristbandInput.trim();
                if (v) identify("WRISTBAND", v);
              }}
              className="w-full flex flex-col gap-3"
            >
              <input
                value={wristbandInput}
                onChange={(e) => setWristbandInput(e.target.value.toUpperCase())}
                placeholder="WRIST-..."
                className="w-full min-h-[48px] px-4 py-3 rounded-xl text-white placeholder-white/20 text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                autoComplete="off"
                autoCapitalize="characters"
              />
              <button
                type="submit"
                disabled={!wristbandInput.trim() || busy}
                className="kiosk-btn kiosk-btn-primary w-full min-h-[48px]"
                style={{ background: "#7c3aed" }}
              >
                Find my photos
              </button>
            </form>
          </div>
        </div>
        {err && <div className="mt-6 text-red-400 anim-shake">{err}</div>}
        {busy && <div className="mt-6 text-white/40 anim-pulse-soft">Searching...</div>}

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
                    identify(inputModal.type as "ROOM" | "NFC", inputValue.trim());
                    setInputModal(null);
                  }
                  if (e.key === "Escape") setInputModal(null);
                }}
              />
              <div className="flex gap-3">
                <button onClick={() => setInputModal(null)} className="kiosk-btn kiosk-btn-ghost flex-1 min-h-[48px]">
                  Cancel
                </button>
                <button
                  disabled={!inputValue.trim()}
                  onClick={() => {
                    identify(inputModal.type as "ROOM" | "NFC", inputValue.trim());
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
    );
  }

  // ── STEP browse ──
  if ((step === "browse" || step === "preview") && active) {
    const previewPhoto = previewId ? active.photos.find((p) => p.id === previewId) : null;
    const cachedCount = Object.keys(cachedUrls).length;
    const totalCount = active.photos.length;
    return (
      <div className="fixed inset-0 text-white flex flex-col" style={{ background: "#050a12" }}>
        <header className="p-6 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div className="kiosk-badge mb-2" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>Browse</div>
            <h1 className="text-xl font-bold tracking-tight">Tap to preview &middot; long-press to add</h1>
          </div>
          <div className="flex items-center gap-4">
            {cacheProgress && cacheProgress.done < cacheProgress.total ? (
              <div className="inline-flex items-center gap-2 text-xs text-white/30">
                <Database className="h-3 w-3 anim-pulse-soft" />
                Caching {cacheProgress.done}/{cacheProgress.total}
              </div>
            ) : cachedCount > 0 ? (
              <div className="inline-flex items-center gap-1.5 text-xs text-green-400/70">
                <Database className="h-3 w-3" />
                {cachedCount}/{totalCount} cached
              </div>
            ) : null}
            <button onClick={reset} className="kiosk-btn kiosk-btn-ghost">
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {active.photos.map((p) => {
              const sel = selected.has(p.id);
              const isCached = !!cachedUrls[p.id];
              const imgSrc = cachedUrls[p.id] || cleanUrl(photoRef(p), 1200);
              return (
                <div key={p.id} className="relative">
                  <button
                    onClick={() => setPreviewId(p.id)}
                    onDoubleClick={() => toggle(p.id)}
                    className="relative w-full rounded-2xl overflow-hidden aspect-square min-h-[200px] transition-all duration-200"
                    style={{
                      border: sel ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                    {isCached && (
                      <span className="absolute bottom-2 left-2 text-green-400/60 text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <Database className="h-2.5 w-2.5" /> Cached
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => toggle(p.id)}
                    className="absolute top-2 right-2 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: sel ? "#6366f1" : "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {sel ? <Check className="h-5 w-5 text-white" strokeWidth={3} /> : <ShoppingCart className="h-4 w-4 text-white" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {previewPhoto && (
          <div className="fixed inset-0 z-30 flex flex-col anim-fade-in" style={{ background: "rgba(0,0,0,0.95)" }} onClick={() => setPreviewId(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cachedUrls[previewPhoto.id] || cleanUrl(photoRef(previewPhoto), 2400)}
              alt=""
              className="flex-1 object-contain w-full"
            />
            <div className="p-6 flex justify-center gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); toggle(previewPhoto.id); }}
                className="kiosk-btn px-6 py-3 font-semibold text-white"
                style={{
                  background: selected.has(previewPhoto.id) ? "rgba(255,255,255,0.1)" : "#6366f1",
                  border: selected.has(previewPhoto.id) ? "1px solid rgba(255,255,255,0.15)" : "none",
                }}
              >
                {selected.has(previewPhoto.id) ? "Remove from cart" : "Add to cart"}
              </button>
              <button onClick={() => setPreviewId(null)} className="kiosk-btn kiosk-btn-ghost">
                Close
              </button>
            </div>
          </div>
        )}

        <footer className="p-6 flex items-center gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <ShoppingCart className="h-5 w-5 text-white/30" />
          <div className="text-white/50 text-sm">
            {selected.size} of {active.photos.length} selected
          </div>
          <div className="flex-1" />
          <button
            disabled={!selected.size}
            onClick={() => setStep("checkout")}
            className="kiosk-btn kiosk-btn-primary px-8 py-4"
          >
            Checkout <ArrowRight className="h-5 w-5" />
          </button>
        </footer>
      </div>
    );
  }

  // ── STEP checkout — Anchor pricing ──
  if (step === "checkout" && active) {
    return <AnchorCheckout
      active={active}
      selected={selected}
      busy={busy}
      onPayNow={payNow}
      onOrderAtCounter={orderAtCounter}
      onBack={() => setStep("browse")}
    />;
  }

  // ── STEP done ──
  return (
    <div className="fixed inset-0 kiosk-mesh-success text-white flex flex-col items-center justify-center p-8">
      <div className="relative mb-8 anim-scale-in">
        <div className="absolute inset-0 blur-3xl rounded-full" style={{ background: "rgba(34, 197, 94, 0.2)" }} />
        <div className="relative h-28 w-28 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
          <Check className="h-14 w-14 text-white" strokeWidth={3} />
        </div>
      </div>
      <h1 className="text-5xl font-bold tracking-tight mb-3 anim-slide-up" style={{ animationDelay: "100ms" }}>All set!</h1>
      <p className="text-lg text-white/40 mb-6 anim-slide-up" style={{ animationDelay: "150ms" }}>{orderMsg}</p>
      {qrText && (
        <div className="bg-white text-gray-900 rounded-2xl p-6 inline-flex flex-col items-center anim-scale-in" style={{ animationDelay: "200ms" }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrText)}`}
            alt="QR"
            className="rounded-xl"
          />
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

function AnchorCheckout({
  active,
  selected,
  busy,
  onPayNow,
  onOrderAtCounter,
  onBack,
}: {
  active: any;
  selected: Set<string>;
  busy: boolean;
  onPayNow: () => void;
  onOrderAtCounter: () => void;
  onBack: () => void;
}) {
  const [screen, setScreen] = useState<"anchor" | "compromise" | "individual" | "print" | "digital_pass">("anchor");
  const [tick, setTick] = useState(0);
  const ANCHOR_DELAY = 10;

  useEffect(() => {
    if (screen !== "anchor") return;
    const t = setInterval(() => setTick((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [screen]);

  const ANCHOR_PRICE = 130;
  const partialPrice = selected.size * 5;
  const showSeeOptions = tick >= ANCHOR_DELAY;

  // SCREEN 1 — THE ANCHOR
  if (screen === "anchor") {
    const heroPhotos = active.photos.slice(0, 5);
    const heroIndex = tick % Math.max(1, heroPhotos.length);
    const hero = heroPhotos[heroIndex];
    return (
      <div className="fixed inset-0 text-white flex flex-col" style={{ background: "#050a12" }}>
        <div className="flex-1 relative overflow-hidden">
          {hero && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={hero.id}
              src={cleanUrl(photoRef(hero), 1600)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover anim-fade-in"
              style={{ opacity: 0.8 }}
            />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #050a12 0%, #050a12cc 35%, transparent 65%)" }} />
          <div className="absolute bottom-0 left-0 right-0 p-12 text-center">
            <div className="kiosk-badge mx-auto mb-4 anim-slide-up" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc" }}>
              <Sparkles className="h-3 w-3" /> Your Complete Memory Collection
            </div>
            <h1 className="text-7xl font-bold tracking-tight mb-3 anim-slide-up" style={{ animationDelay: "50ms" }}>&euro;{ANCHOR_PRICE}</h1>
            <p className="text-white/50 text-xl mb-8 anim-slide-up" style={{ animationDelay: "100ms" }}>
              All {active.photos.length} high-resolution photos &middot; Delivered to your phone
            </p>
            <button
              onClick={onPayNow}
              disabled={busy}
              className="kiosk-btn kiosk-btn-primary px-12 py-5 text-xl anim-slide-up anim-glow"
              style={{ animationDelay: "150ms" }}
            >
              <Sparkles className="h-5 w-5" /> Unlock All
            </button>
          </div>
        </div>
        <div className="p-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onBack} className="text-white/30 text-sm hover:text-white/50 transition">
            &larr; Back
          </button>
          {showSeeOptions ? (
            <button onClick={() => setScreen("compromise")} className="text-indigo-400 text-sm font-semibold hover:underline transition">
              See other options &rarr;
            </button>
          ) : (
            <span className="text-white/15 text-xs tabular-nums">{ANCHOR_DELAY - tick}s</span>
          )}
        </div>
      </div>
    );
  }

  // SCREEN 2 — THE COMPROMISE
  if (screen === "compromise") {
    return (
      <div className="fixed inset-0 kiosk-mesh text-white flex flex-col items-center justify-center p-8 gap-8">
        <div className="kiosk-badge anim-slide-up" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>Choose your package</div>
        <h1 className="text-4xl font-bold tracking-tight anim-slide-up" style={{ animationDelay: "50ms" }}>3 ways to take your memories home</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl w-full stagger">
          {/* Best Value */}
          <button
            onClick={onPayNow}
            disabled={busy}
            className="relative kiosk-card active p-6 text-left hover:scale-[1.02] transition-all col-span-2 md:col-span-1 anim-slide-up"
            style={{ borderColor: "#6366f1" }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.12em] px-3 py-1 rounded-full" style={{ background: "#6366f1", color: "white" }}>
              Best Value
            </div>
            <Sparkles className="h-6 w-6 text-indigo-400 mb-3" />
            <div className="text-xl font-bold mb-1">All Photos &mdash; Digital</div>
            <div className="text-3xl font-bold text-indigo-400 mb-2 tabular-nums">&euro;{ANCHOR_PRICE}</div>
            <p className="text-white/40 text-sm">Every photo, full resolution, delivered instantly.</p>
          </button>

          {/* Selected */}
          <button
            onClick={() => setScreen("individual")}
            className="kiosk-card p-6 text-left anim-slide-up"
          >
            <ShoppingCart className="h-6 w-6 text-violet-400 mb-3" />
            <div className="text-xl font-bold mb-1">Selected Photos</div>
            <div className="text-3xl font-bold text-white mb-2 tabular-nums">&euro;{partialPrice || 45}</div>
            <p className="text-white/35 text-sm">{selected.size || "Pick"} photos &middot; pay for what you choose.</p>
          </button>

          {/* Print */}
          <button
            onClick={() => setScreen("print")}
            className="kiosk-card p-6 text-left anim-slide-up"
          >
            <Printer className="h-6 w-6 text-amber-400 mb-3" />
            <div className="text-xl font-bold mb-1">Printed Photo</div>
            <div className="text-3xl font-bold text-white mb-2">from &euro;15</div>
            <p className="text-white/35 text-sm">High-quality print &middot; ready at the counter.</p>
          </button>

          {/* Digital Pass */}
          <button
            onClick={() => setScreen("digital_pass")}
            className="kiosk-card p-6 text-left anim-slide-up"
          >
            <CreditCard className="h-6 w-6 text-emerald-400 mb-3" />
            <div className="text-xl font-bold mb-1">Digital Pass</div>
            <div className="text-3xl font-bold text-white mb-2">150 TND</div>
            <p className="text-white/35 text-sm">Unlimited photos for your entire stay.</p>
          </button>

          {/* Single */}
          <button
            onClick={() => setScreen("individual")}
            className="kiosk-card p-6 text-left anim-slide-up"
            style={{ opacity: 0.6 }}
          >
            <Image className="h-6 w-6 text-white/25 mb-3" />
            <div className="text-lg font-bold mb-1 text-white/50">Single Photo</div>
            <div className="text-xl text-white/40 mb-2">from &euro;5</div>
            <p className="text-white/25 text-xs">Buy one photo at a time.</p>
          </button>
        </div>

        <button onClick={() => setScreen("anchor")} className="kiosk-btn kiosk-btn-ghost text-sm">
          &larr; Back
        </button>
      </div>
    );
  }

  // SCREEN 3 — INDIVIDUAL
  if (screen === "individual") {
    return (
      <div className="fixed inset-0 kiosk-mesh text-white flex flex-col items-center justify-center p-8 gap-8">
        <div className="kiosk-badge anim-slide-up" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>Choose how to pay</div>
        <h1 className="text-5xl font-bold tracking-tight anim-slide-up" style={{ animationDelay: "50ms" }}>{selected.size} photos &middot; &euro;{partialPrice}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full stagger">
          <button onClick={onPayNow} disabled={busy} className="kiosk-card p-8 text-left hover:border-indigo-500/30 transition anim-slide-up">
            <Sparkles className="h-7 w-7 text-indigo-400 mb-3" />
            <div className="text-2xl font-bold text-white">Pay now</div>
            <p className="text-white/35 text-sm mt-2">Scan a QR with your phone. Photos delivered instantly via WhatsApp.</p>
          </button>
          <button onClick={onOrderAtCounter} disabled={busy} className="kiosk-card p-8 text-left hover:border-amber-500/30 transition anim-slide-up">
            <ShoppingCart className="h-7 w-7 text-amber-400 mb-3" />
            <div className="text-2xl font-bold text-white">Order at counter</div>
            <p className="text-white/35 text-sm mt-2">Send your selection to the photographer. Pay by card or cash.</p>
          </button>
        </div>
        <button onClick={() => setScreen("compromise")} className="kiosk-btn kiosk-btn-ghost text-sm">
          &larr; Back
        </button>
      </div>
    );
  }

  // SCREEN 4 — PRINT
  if (screen === "print") {
    return (
      <div className="fixed inset-0 kiosk-mesh text-white flex flex-col items-center justify-center p-8 gap-8">
        <div className="kiosk-badge anim-slide-up" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#fbbf24" }}>Printed Photos</div>
        <Printer className="h-14 w-14 text-amber-400 anim-scale-in" />
        <h1 className="text-5xl font-bold tracking-tight anim-slide-up" style={{ animationDelay: "50ms" }}>Order a print</h1>
        <p className="text-white/40 text-lg text-center max-w-md anim-slide-up" style={{ animationDelay: "100ms" }}>
          Select your photos and go to the counter to choose your print size and finish.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full stagger">
          <div className="kiosk-card p-6 text-center anim-slide-up">
            <div className="text-xl font-bold mb-1">10&times;15 cm</div>
            <div className="text-3xl font-bold text-amber-400 mb-1 tabular-nums">&euro;15</div>
            <p className="text-white/35 text-sm">Classic wallet size</p>
          </div>
          <div className="kiosk-card p-6 text-center relative anim-slide-up" style={{ borderColor: "rgba(245, 158, 11, 0.4)" }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.12em] px-3 py-1 rounded-full" style={{ background: "#f59e0b", color: "#050a12" }}>Popular</div>
            <div className="text-xl font-bold mb-1">20&times;30 cm</div>
            <div className="text-3xl font-bold text-amber-400 mb-1 tabular-nums">&euro;25</div>
            <p className="text-white/35 text-sm">Perfect for framing</p>
          </div>
          <div className="kiosk-card p-6 text-center anim-slide-up">
            <div className="text-xl font-bold mb-1">Luxury Album</div>
            <div className="text-3xl font-bold text-amber-400 mb-1 tabular-nums">&euro;150</div>
            <p className="text-white/35 text-sm">All photos, hardcover bound</p>
          </div>
        </div>
        <button
          onClick={onOrderAtCounter}
          disabled={busy}
          className="kiosk-btn kiosk-btn-primary px-10 py-4 text-xl anim-slide-up"
          style={{ background: "#d97706", animationDelay: "200ms" }}
        >
          <Printer className="h-5 w-5" /> Order at counter
        </button>
        <button onClick={() => setScreen("compromise")} className="kiosk-btn kiosk-btn-ghost text-sm">
          &larr; Back
        </button>
      </div>
    );
  }

  // SCREEN 5 — DIGITAL PASS
  return (
    <div className="fixed inset-0 kiosk-mesh text-white flex flex-col items-center justify-center p-8 gap-8">
      <div className="kiosk-badge anim-slide-up" style={{ background: "rgba(34, 197, 94, 0.12)", color: "#4ade80" }}>Digital Pass</div>
      <CreditCard className="h-14 w-14 text-emerald-400 anim-scale-in" />
      <h1 className="text-5xl font-bold tracking-tight anim-slide-up" style={{ animationDelay: "50ms" }}>Unlimited Photo Pass</h1>
      <p className="text-white/40 text-lg text-center max-w-md anim-slide-up" style={{ animationDelay: "100ms" }}>
        One price covers every photo taken during your entire stay. Auto-delivered to your phone.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full stagger">
        <div className="kiosk-card p-6 text-center anim-slide-up">
          <div className="text-xl font-bold mb-1">Basic</div>
          <div className="text-3xl font-bold text-emerald-400 mb-1 tabular-nums">80 TND</div>
          <p className="text-white/35 text-sm">Up to 20 photos</p>
        </div>
        <div className="kiosk-card p-6 text-center relative anim-slide-up" style={{ borderColor: "rgba(34, 197, 94, 0.4)" }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.12em] px-3 py-1 rounded-full" style={{ background: "#22c55e", color: "#050a12" }}>Most Popular</div>
          <div className="text-xl font-bold mb-1">Unlimited</div>
          <div className="text-3xl font-bold text-emerald-400 mb-1 tabular-nums">150 TND</div>
          <p className="text-white/35 text-sm">All photos, whole stay</p>
        </div>
        <div className="kiosk-card p-6 text-center anim-slide-up">
          <div className="text-xl font-bold mb-1">VIP</div>
          <div className="text-3xl font-bold text-emerald-400 mb-1 tabular-nums">250 TND</div>
          <p className="text-white/35 text-sm">Priority + sunset session</p>
        </div>
      </div>
      <button
        onClick={onOrderAtCounter}
        disabled={busy}
        className="kiosk-btn kiosk-btn-primary px-10 py-4 text-xl anim-slide-up"
        style={{ background: "#059669", animationDelay: "200ms" }}
      >
        <CreditCard className="h-5 w-5" /> Purchase at counter
      </button>
      <button onClick={() => setScreen("compromise")} className="kiosk-btn kiosk-btn-ghost text-sm">
        &larr; Back
      </button>
    </div>
  );
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
