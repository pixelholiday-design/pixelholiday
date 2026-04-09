"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScanLine, User, KeyRound, Check, ArrowRight, RefreshCw, ShoppingCart, X, Sparkles, Tag, Wifi, Database } from "lucide-react";
import { cleanUrl, photoRef } from "@/lib/cloudinary";
import { loadKioskSettings, localApiBase } from "@/lib/kiosk-mode";
import ConnectionStatus from "@/components/kiosk/ConnectionStatus";
import QRScanner from "@/components/mobile/QRScanner";
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

  // Photo cache state
  const [cachedUrls, setCachedUrls] = useState<Record<string, string>>({});
  const [cacheProgress, setCacheProgress] = useState<{ done: number; total: number } | null>(null);
  const cacheAbortRef = useRef(false);

  // Pre-cache gallery photos into IndexedDB when a gallery is loaded
  useEffect(() => {
    if (!active) return;
    cacheAbortRef.current = false;

    const autoCache = loadKioskSettings()?.autoCache !== false; // default on
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
      // Load object URLs for cached photos so they display instantly
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

  // ── STEP id ──
  if (step === "id") {
    return (
      <div className="fixed inset-0 bg-navy-900 text-white flex flex-col items-center justify-center p-8 text-center">
        <ConnectionStatus baseUrl={apiBase} />
        <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-3 inline-flex items-center gap-2">
          <Sparkles className="h-3 w-3" /> Customer Gallery
        </div>
        <h1 className="font-display text-6xl mb-4">Find your photos</h1>
        <p className="text-white/60 text-xl mb-12">Choose how you'd like to identify yourself.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-5xl w-full">
          {/* QR Scanner — uses BarcodeDetector or manual code entry */}
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-2xl bg-coral-500/15 text-coral-400 flex items-center justify-center mb-5">
              <ScanLine className="h-10 w-10" />
            </div>
            <div className="font-display text-2xl mb-1 text-white">Scan QR code</div>
            <div className="text-white/50 mb-4">Wristband or booking code</div>
            {showQrScanner ? (
              <>
                <QRScanner
                  onResult={(code) => {
                    setShowQrScanner(false);
                    identify("WRISTBAND", code);
                  }}
                />
                <button
                  onClick={() => setShowQrScanner(false)}
                  className="mt-3 text-white/40 text-xs hover:text-white/70"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowQrScanner(true)}
                className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-coral-500 to-coral-700 text-white font-semibold"
              >
                Open Scanner
              </button>
            )}
          </div>

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
          {/* NFC tap */}
          <IdCard
            icon={<Wifi className="h-10 w-10" />}
            title="Tap NFC tag"
            sub="Touch your NFC wristband or card to the reader"
            onClick={() => {
              const v = prompt("NFC tag ID (auto-read in production)");
              if (v) identify("NFC", v);
            }}
          />
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-2xl bg-brand-500/15 text-brand-300 flex items-center justify-center mb-5">
              <Tag className="h-10 w-10" />
            </div>
            <div className="font-display text-2xl mb-1 text-white">Enter wristband code</div>
            <div className="text-white/50 mb-4">Type the code on your band</div>
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
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
                autoComplete="off"
                autoCapitalize="characters"
              />
              <button
                type="submit"
                disabled={!wristbandInput.trim() || busy}
                className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-semibold disabled:opacity-40"
              >
                Find my photos
              </button>
            </form>
          </div>
        </div>
        {err && <div className="mt-6 text-coral-400">{err}</div>}
        {busy && <div className="mt-6 text-white/60">Searching…</div>}
      </div>
    );
  }

  // ── STEP browse ──
  if ((step === "browse" || step === "preview") && active) {
    const previewPhoto = previewId ? active.photos.find((p) => p.id === previewId) : null;
    const cachedCount = Object.keys(cachedUrls).length;
    const totalCount = active.photos.length;
    return (
      <div className="fixed inset-0 bg-navy-900 text-white flex flex-col">
        <header className="p-6 flex items-center justify-between border-b border-white/5">
          <div>
            <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-1">Browse</div>
            <h1 className="font-display text-2xl">Tap to preview · long-press to add</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Cache status indicator */}
            {cacheProgress && cacheProgress.done < cacheProgress.total ? (
              <div className="inline-flex items-center gap-2 text-xs text-white/50">
                <Database className="h-3 w-3 animate-pulse" />
                Caching {cacheProgress.done}/{cacheProgress.total}
              </div>
            ) : cachedCount > 0 ? (
              <div className="inline-flex items-center gap-1.5 text-xs text-green-400">
                <Database className="h-3 w-3" />
                {cachedCount}/{totalCount} cached
              </div>
            ) : null}
            <button onClick={reset} className="btn-ghost text-white/70">
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
                    className={`relative w-full rounded-2xl overflow-hidden aspect-square min-h-[200px] transition ${
                      sel ? "ring-4 ring-coral-500" : "ring-1 ring-white/10"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                    {isCached && (
                      <span className="absolute bottom-2 left-2 bg-black/60 text-green-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Database className="h-2.5 w-2.5" /> Cached
                      </span>
                    )}
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
              src={cachedUrls[previewPhoto.id] || cleanUrl(photoRef(previewPhoto), 2400)}
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

  // ── STEP checkout — 3-screen VIP anchor reveal ──
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
  // Three screens: anchor → compromise → individual
  const [screen, setScreen] = useState<"anchor" | "compromise" | "individual">("anchor");
  const [tick, setTick] = useState(0);
  const ANCHOR_DELAY = 10; // seconds before "See options" appears

  // Countdown on anchor screen
  useEffect(() => {
    if (screen !== "anchor") return;
    const t = setInterval(() => setTick((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [screen]);

  const ANCHOR_PRICE = 130;
  const partialPrice = selected.size * 5;
  const fullPrice = active.photos.length * 5;
  const showSeeOptions = tick >= ANCHOR_DELAY;

  // SCREEN 1 — THE ANCHOR
  if (screen === "anchor") {
    const heroPhotos = active.photos.slice(0, 5);
    const heroIndex = tick % Math.max(1, heroPhotos.length);
    const hero = heroPhotos[heroIndex];
    return (
      <div className="fixed inset-0 bg-navy-900 text-white flex flex-col">
        <div className="flex-1 relative overflow-hidden">
          {hero && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={hero.id}
              src={cleanUrl(photoRef(hero), 1600)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-90 anim-fade-up"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-12 text-center">
            <div className="text-gold-400 uppercase tracking-[0.3em] text-xs font-bold mb-2 inline-block">
              <Sparkles className="h-3 w-3 inline mr-1" /> Your Complete Memory Collection
            </div>
            <h1 className="font-display text-7xl mb-2">€{ANCHOR_PRICE}</h1>
            <p className="text-white/70 text-xl mb-6">
              All {active.photos.length} high-resolution photos · Delivered to your phone
            </p>
            <button
              onClick={onPayNow}
              disabled={busy}
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-coral-500 to-gold-500 px-12 py-5 text-2xl font-bold text-white shadow-lift hover:scale-105 transition"
            >
              <Sparkles className="h-6 w-6" /> Unlock All
            </button>
          </div>
        </div>
        <div className="p-4 flex items-center justify-between bg-navy-900 border-t border-white/5">
          <button onClick={onBack} className="text-white/50 text-sm hover:text-white">
            ← Back
          </button>
          {showSeeOptions ? (
            <button
              onClick={() => setScreen("compromise")}
              className="text-gold-400 text-sm font-semibold underline-offset-4 hover:underline"
            >
              See other options →
            </button>
          ) : (
            <span className="text-white/30 text-xs">{ANCHOR_DELAY - tick}s</span>
          )}
        </div>
      </div>
    );
  }

  // SCREEN 2 — THE COMPROMISE (3 cards, anchor highlighted)
  if (screen === "compromise") {
    return (
      <div className="fixed inset-0 bg-navy-900 text-white flex flex-col items-center justify-center p-8 gap-8">
        <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold">Choose your package</div>
        <h1 className="font-display text-4xl">3 ways to take your memories home</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full">
          {/* BEST VALUE — Anchor */}
          <button
            onClick={onPayNow}
            disabled={busy}
            className="relative rounded-2xl bg-gradient-to-br from-gold-500/20 to-coral-500/15 border-2 border-gold-500 p-6 text-left hover:scale-105 transition shadow-lift"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-navy-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Best Value
            </div>
            <Sparkles className="h-7 w-7 text-gold-400 mb-3" />
            <div className="font-display text-2xl mb-1">All Photos Pass</div>
            <div className="font-display text-4xl text-gold-400 mb-2">€{ANCHOR_PRICE}</div>
            <p className="text-white/70 text-sm">Every photo, full resolution, delivered instantly to your phone.</p>
          </button>

          {/* Selected — Standard */}
          <button
            onClick={() => setScreen("individual")}
            className="rounded-2xl bg-white/5 border border-white/10 p-6 text-left hover:bg-white/10 transition"
          >
            <ShoppingCart className="h-7 w-7 text-coral-400 mb-3" />
            <div className="font-display text-2xl mb-1">Selected Photos</div>
            <div className="font-display text-3xl text-white mb-2">€{partialPrice || 45}</div>
            <p className="text-white/60 text-sm">{selected.size || "Pick"} photos · pay only for what you choose.</p>
          </button>

          {/* Single — De-emphasized */}
          <button
            onClick={() => setScreen("individual")}
            className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 text-left hover:bg-white/5 transition"
          >
            <div className="font-display text-lg mb-1 text-white/60">Individual Photos</div>
            <div className="text-xl text-white/50 mb-2">from €5</div>
            <p className="text-white/40 text-xs">Buy one photo at a time.</p>
          </button>
        </div>

        <button onClick={() => setScreen("anchor")} className="btn-ghost text-white/50 text-sm">
          ← Back
        </button>
      </div>
    );
  }

  // SCREEN 3 — INDIVIDUAL (the original 2-button checkout)
  return (
    <div className="fixed inset-0 bg-navy-900 text-white flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold">Choose how to pay</div>
      <h1 className="font-display text-5xl">{selected.size} photos · €{partialPrice}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        <button onClick={onPayNow} disabled={busy} className="card !bg-white/5 !border-white/10 p-8 text-left hover:bg-white/10 transition">
          <Sparkles className="h-8 w-8 text-coral-400 mb-3" />
          <div className="font-display text-2xl text-white">Pay now</div>
          <p className="text-white/60 text-sm mt-2">Scan a QR with your phone. Photos delivered instantly via WhatsApp.</p>
        </button>
        <button onClick={onOrderAtCounter} disabled={busy} className="card !bg-white/5 !border-white/10 p-8 text-left hover:bg-white/10 transition">
          <ShoppingCart className="h-8 w-8 text-gold-400 mb-3" />
          <div className="font-display text-2xl text-white">Order at counter</div>
          <p className="text-white/60 text-sm mt-2">Send your selection to the photographer. Pay by card or cash.</p>
        </button>
      </div>
      <button onClick={() => setScreen("compromise")} className="btn-ghost text-white/70 text-sm">
        ← Back
      </button>
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
