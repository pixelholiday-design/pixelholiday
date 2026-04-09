"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, Sparkles, ScanLine, Radio, Users } from "lucide-react";
import { cleanUrl, photoRef } from "@/lib/cloudinary";

type Photo = { id: string; cloudinaryId: string | null; s3Key_highRes: string };
type LivePhoto = { id: string; thumbnailUrl: string; fullUrl: string; isHookImage: boolean; createdAt: string };

export default function TvDisplayPage() {
  const [attractPhotos, setAttractPhotos] = useState<Photo[]>([]);
  const [idx, setIdx] = useState(0);
  const [matchedPhotos, setMatchedPhotos] = useState<Photo[] | null>(null);
  const [matchedName, setMatchedName] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Live stream state
  const [livePhotos, setLivePhotos] = useState<LivePhoto[]>([]);
  const [liveConnected, setLiveConnected] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalPhotosToday, setTotalPhotosToday] = useState(0);
  const [locationId, setLocationId] = useState<string | null>(null);

  // Load attract slideshow + detect location
  useEffect(() => {
    fetch("/api/kiosk/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId: "_any_", method: "SELFIE", selfieData: "attract" }),
    })
      .then((r) => r.json())
      .then((d) => {
        const ph = (d.galleries || []).flatMap((g: any) => g.photos).slice(0, 8);
        if (ph.length) setAttractPhotos(ph);
        if (d.locationId) setLocationId(d.locationId);
      })
      .catch(() => {});
    // Fetch a location for the stream (pick first available)
    fetch("/api/admin/staff")
      .then((r) => r.json())
      .then((d) => {
        const loc = d.locations?.[0]?.id;
        if (loc && !locationId) setLocationId(loc);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Connect to location-wide SSE stream
  useEffect(() => {
    if (!locationId) return;
    const es = new EventSource(`/api/location/${locationId}/stream`);
    es.onopen = () => setLiveConnected(true);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "new_photos") {
          setLivePhotos((prev) => [...data.photos, ...prev].slice(0, 50));
          setTotalPhotosToday((n) => n + data.photos.length);
          setSessionCount((n) => n + 1);
        }
      } catch {}
    };
    es.onerror = () => setLiveConnected(false);
    return () => es.close();
  }, [locationId]);

  // Slideshow rotation — include live photos in the mix
  const allSlidePhotos = [
    ...livePhotos.map((lp) => ({ id: lp.id, cloudinaryId: null, s3Key_highRes: lp.thumbnailUrl })),
    ...attractPhotos,
  ];
  useEffect(() => {
    if (!allSlidePhotos.length || matchedPhotos) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % allSlidePhotos.length), 3500);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSlidePhotos.length, matchedPhotos]);

  // Key controls
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

  // ── Attract mode with live photo wall ────────────────────────────
  const current = allSlidePhotos[idx % allSlidePhotos.length];
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
        {/* Top bar: branding + live indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-coral-500/20 ring-1 ring-coral-500/40 flex items-center justify-center">
              <Camera className="h-6 w-6 text-coral-300" />
            </div>
            <div className="font-display text-3xl">Fotiqo</div>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-3">
            {liveConnected && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 ring-1 ring-white/20">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <Radio className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold">LIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Center content */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-display text-7xl leading-none mb-6">Your memories,<br />delivered.</h1>
          <p className="text-2xl text-white/70 mb-10">
            Scan your wristband at any kiosk to instantly view and unlock the photos taken of you today.
          </p>
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur rounded-full px-6 py-3 ring-1 ring-white/20">
            <ScanLine className="h-5 w-5 text-coral-300" />
            <span className="text-lg">Step up to a kiosk to begin</span>
          </div>

          {/* Live photo preview strip — shows latest arrivals */}
          {livePhotos.length > 0 && (
            <div className="mt-10">
              <div className="text-xs uppercase tracking-widest text-white/40 mb-3 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Photos arriving now
              </div>
              <div className="flex justify-center gap-2 overflow-hidden">
                {livePhotos.slice(0, 6).map((lp, i) => (
                  <div
                    key={lp.id}
                    className="w-20 h-20 rounded-xl overflow-hidden ring-1 ring-white/20 animate-fade-in flex-shrink-0"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={lp.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-xs text-white/40 space-y-1">
            <div>
              Press <kbd className="px-2 py-0.5 bg-white/10 rounded">I</kbd> to simulate identification &nbsp;·&nbsp;
              Press <kbd className="px-2 py-0.5 bg-white/10 rounded">C</kbd> to toggle camera preview
            </div>
          </div>
          {cameraActive && (
            <div className="mt-6 rounded-2xl overflow-hidden ring-1 ring-white/20 bg-white/5 w-80 mx-auto relative">
              <CameraPreview />
              <div className="absolute bottom-0 left-0 right-0 bg-navy-900/80 text-[10px] text-white/50 text-center py-1 tracking-wider uppercase">
                Camera feed · motion detection active
              </div>
            </div>
          )}
        </div>

        {/* Bottom ticker */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white/50 text-sm">
            {sessionCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {sessionCount} session{sessionCount !== 1 ? "s" : ""} today
              </span>
            )}
            {totalPhotosToday > 0 && (
              <span className="flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" />
                {totalPhotosToday} photos captured
              </span>
            )}
          </div>
          <div className="text-white/40 text-sm">
            {allSlidePhotos.length > 0 && (
              <span>
                {(idx % allSlidePhotos.length) + 1} / {allSlidePhotos.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
