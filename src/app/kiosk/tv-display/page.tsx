"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Sparkles, ScanLine, Radio, Users, Aperture } from "lucide-react";
import { cleanUrl, photoRef } from "@/lib/cloudinary";
import { loadKioskSettings, localApiBase } from "@/lib/kiosk-mode";

type Photo = { id: string; cloudinaryId: string | null; s3Key_highRes: string };
type LivePhoto = { id: string; thumbnailUrl: string; fullUrl: string; isHookImage: boolean; createdAt: string };

export default function TvDisplayPage() {
  const settings = useMemo(() => loadKioskSettings(), []);
  const apiBase = useMemo(() => localApiBase(settings), []);
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
    fetch(apiBase + "/api/kiosk/identify", {
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
    fetch(apiBase + "/api/admin/staff")
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

  // Slideshow rotation
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
    const r = await fetch(apiBase + "/api/kiosk/identify", {
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
      <div className="fixed inset-0 kiosk-mesh text-white flex flex-col">
        <header className="p-10 text-center anim-slide-up">
          <div className="kiosk-badge mx-auto mb-4" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
            <Sparkles className="h-3 w-3" /> Welcome, {matchedName}
          </div>
          <h1 className="text-5xl font-bold tracking-tight mt-3">We found your photos</h1>
          <p className="text-white/50 mt-3 text-lg">Step up to a kiosk to take them home.</p>
        </header>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 p-6 stagger">
          {matchedPhotos.slice(0, 8).map((p) => (
            <div key={p.id} className="rounded-2xl overflow-hidden kiosk-card anim-scale-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cleanUrl(photoRef(p), 1200)} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Attract mode ────────────────────────────
  const current = allSlidePhotos[idx % allSlidePhotos.length];
  return (
    <div className="fixed inset-0 text-white overflow-hidden" style={{ background: "#050a12" }}>
      {current ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.id}
            src={cleanUrl(photoRef(current), 2000)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 anim-fade-in"
            style={{ opacity: 0.7 }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #050a12 0%, #050a12cc 30%, transparent 60%, #050a1266 100%)" }} />
        </>
      ) : (
        <div className="absolute inset-0 kiosk-mesh" />
      )}

      <div className="relative z-10 h-full flex flex-col justify-between p-12">
        {/* Top bar */}
        <div className="flex items-center justify-between anim-slide-up">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(99, 102, 241, 0.15)" }}>
              <Aperture className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight">Fotiqo</div>
          </div>
          {liveConnected && (
            <div className="kiosk-badge" style={{ background: "rgba(34, 197, 94, 0.12)", color: "#4ade80" }}>
              <span className="w-2 h-2 rounded-full bg-green-400 anim-pulse-soft" />
              <Radio className="h-3.5 w-3.5" />
              LIVE
            </div>
          )}
        </div>

        {/* Center content */}
        <div className="text-center max-w-3xl mx-auto anim-slide-up" style={{ animationDelay: "100ms" }}>
          <h1 className="text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Your memories,<br />delivered.
          </h1>
          <p className="text-xl text-white/50 mb-10 max-w-xl mx-auto">
            Scan your wristband at any kiosk to instantly view and unlock your photos.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ScanLine className="h-5 w-5 text-indigo-400" />
            <span className="text-base text-white/70">Step up to a kiosk to begin</span>
          </div>

          {/* Live photo strip */}
          {livePhotos.length > 0 && (
            <div className="mt-10 anim-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-3 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 anim-pulse-soft" />
                Photos arriving now
              </div>
              <div className="flex justify-center gap-2 overflow-hidden stagger">
                {livePhotos.slice(0, 6).map((lp) => (
                  <div
                    key={lp.id}
                    className="w-20 h-20 rounded-xl overflow-hidden anim-scale-in flex-shrink-0"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={lp.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-[11px] text-white/20 space-y-1">
            <div>
              Press <kbd className="px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)" }}>I</kbd> to simulate identification &nbsp;&middot;&nbsp;
              Press <kbd className="px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)" }}>C</kbd> to toggle camera
            </div>
          </div>
          {cameraActive && (
            <div className="mt-6 rounded-2xl overflow-hidden w-80 mx-auto relative" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <CameraPreview />
              <div className="absolute bottom-0 left-0 right-0 text-[10px] text-white/30 text-center py-1.5 tracking-wider uppercase" style={{ background: "rgba(5,10,18,0.8)" }}>
                Camera feed &middot; motion detection active
              </div>
            </div>
          )}
        </div>

        {/* Bottom ticker */}
        <div className="flex items-center justify-between text-white/30 text-sm">
          <div className="flex items-center gap-5">
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
          {allSlidePhotos.length > 0 && (
            <span className="tabular-nums">
              {(idx % allSlidePhotos.length) + 1} / {allSlidePhotos.length}
            </span>
          )}
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
      <div className="flex flex-col items-center justify-center h-48 text-white/30 text-xs gap-2 p-4">
        <Camera className="h-8 w-8 opacity-30" />
        <span className="text-center">Camera feed would appear here</span>
        <span className="text-white/15 text-[10px] text-center">{err}</span>
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
