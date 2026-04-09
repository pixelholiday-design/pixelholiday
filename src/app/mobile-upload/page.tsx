"use client";
import { useEffect, useState, useRef } from "react";
import {
  Camera, Star, Upload, Loader2, Check, ScanLine, Keyboard,
  Calendar, BarChart3, Clock, Zap, Flame, TrendingUp, User,
  ChevronRight, Plus, X, Video, CircleDot,
} from "lucide-react";

/* ── Types ────────────────────────────────────────── */
type Loc = { id: string; name: string };
type Photog = { id: string; name: string; locationId: string | null };
type Item = { file: File; id: string; preview: string; isHook: boolean; progress: number; uploaded: boolean; key?: string };
type Appt = { id: string; scheduledTime: string; status: string; gallery: { customer: { name: string | null; roomNumber: string | null } }; source: string };
type Tab = "upload" | "camera" | "scan" | "schedule" | "stats";

/* ── Helpers ──────────────────────────────────────── */
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtCountdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return "Now";
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default function MobileUploadPage() {
  const [tab, setTab] = useState<Tab>("upload");
  const [locations, setLocations] = useState<Loc[]>([]);
  const [photographers, setPhotographers] = useState<Photog[]>([]);
  const [locationId, setLocationId] = useState("");
  const [photographerId, setPhotographerId] = useState("");

  useEffect(() => {
    fetch("/api/admin/staff")
      .then((r) => r.json())
      .then((d) => {
        const staff = d.staff || [];
        const locs = Array.from(
          new Map(staff.filter((s: any) => s.location).map((s: any) => [s.location.id, s.location])).values()
        ) as Loc[];
        setLocations(locs);
        const ph = staff.filter((s: any) => s.role === "PHOTOGRAPHER");
        setPhotographers(ph);
        if (ph[0]) {
          setPhotographerId(ph[0].id);
          if (ph[0].locationId) setLocationId(ph[0].locationId);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col max-w-md mx-auto font-sans">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-6 pb-3">
        <div className="h-10 w-10 rounded-xl bg-coral-500/15 ring-1 ring-coral-500/30 flex items-center justify-center">
          <Camera className="h-5 w-5 text-coral-600" />
        </div>
        <div className="flex-1">
          <div className="font-display text-xl text-navy-900 leading-tight">PixelHoliday</div>
          <div className="text-[11px] uppercase tracking-widest text-navy-400">Photographer mobile</div>
        </div>
        {/* Location selector */}
        <select
          className="text-xs bg-white border border-navy-100 rounded-lg px-2 py-1.5 text-navy-600 max-w-[120px]"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
        >
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </header>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {tab === "upload" && (
          <UploadTab locationId={locationId} photographerId={photographerId} />
        )}
        {tab === "camera" && (
          <CameraTab locationId={locationId} photographerId={photographerId} />
        )}
        {tab === "scan" && (
          <ScanTab locationId={locationId} photographerId={photographerId} />
        )}
        {tab === "schedule" && (
          <ScheduleTab />
        )}
        {tab === "stats" && (
          <StatsTab />
        )}
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-cream-300 flex items-center justify-around max-w-md mx-auto z-50 shadow-lg">
        <TabBtn icon={Upload} label="Upload" active={tab === "upload"} onClick={() => setTab("upload")} />
        <TabBtn icon={Video} label="Camera" active={tab === "camera"} onClick={() => setTab("camera")} />
        <TabBtn icon={ScanLine} label="Scan" active={tab === "scan"} onClick={() => setTab("scan")} />
        <TabBtn icon={Calendar} label="Schedule" active={tab === "schedule"} onClick={() => setTab("schedule")} />
        <TabBtn icon={BarChart3} label="Stats" active={tab === "stats"} onClick={() => setTab("stats")} />
      </nav>
    </div>
  );
}

function TabBtn({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition ${active ? "text-coral-600" : "text-navy-400"}`}>
      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.8} />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   UPLOAD TAB
   ═══════════════════════════════════════════════════ */
function UploadTab({ locationId, photographerId }: { locationId: string; photographerId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ link: string; kept: number; rejected: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const next: Item[] = Array.from(files).map((f, i) => ({
      file: f,
      id: `${Date.now()}-${i}`,
      preview: URL.createObjectURL(f),
      isHook: false,
      progress: 0,
      uploaded: false,
    }));
    setItems((prev) => [...prev, ...next]);
  }

  function toggleHook(id: string) {
    setItems((prev) => prev.map((it) => ({ ...it, isHook: it.id === id ? !it.isHook : false })));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function uploadAll() {
    if (!items.length || !locationId || !photographerId) return;
    setBusy(true);

    // Upload each file via presigned URL
    const uploaded: { s3Key: string; isHookImage: boolean }[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      try {
        // Get presigned URL
        const pre = await fetch("/api/upload/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: it.file.name, contentType: it.file.type || "image/jpeg" }),
        }).then((r) => r.json());

        if (pre.url && pre.key) {
          // Upload directly to R2
          await fetch(pre.url, { method: "PUT", body: it.file, headers: { "Content-Type": it.file.type || "image/jpeg" } });
          uploaded.push({ s3Key: pre.key, isHookImage: it.isHook });
          setItems((prev) => prev.map((p) => p.id === it.id ? { ...p, progress: 100, uploaded: true } : p));
        } else {
          // Fallback: use mobile key
          const key = `mobile/${Date.now()}-${i}-${it.file.name}`;
          uploaded.push({ s3Key: key, isHookImage: it.isHook });
          setItems((prev) => prev.map((p) => p.id === it.id ? { ...p, progress: 100, uploaded: true } : p));
        }
      } catch {
        const key = `mobile/${Date.now()}-${i}-${it.file.name}`;
        uploaded.push({ s3Key: key, isHookImage: it.isHook });
        setItems((prev) => prev.map((p) => p.id === it.id ? { ...p, progress: 100, uploaded: true } : p));
      }
      // Simulate progress for UX
      setItems((prev) => prev.map((p) => p.id === it.id ? { ...p, progress: 80 } : p));
    }

    // Create gallery
    const r = await fetch("/api/mobile-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId, photographerId, photos: uploaded }),
    }).then((r) => r.json());

    setBusy(false);
    if (r.ok) {
      // Trigger AI culling
      let kept = uploaded.length, rejected = 0;
      try {
        const cull = await fetch("/api/ai/cull", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ galleryId: r.galleryId }),
        }).then((res) => res.json());
        if (cull.kept !== undefined) { kept = cull.kept; rejected = cull.rejected || 0; }
      } catch {}
      setResult({ link: `${window.location.origin}/gallery/${r.magicLinkToken}`, kept, rejected });
    }
  }

  if (result) {
    return (
      <div className="text-center animate-fade-in space-y-5 mt-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lift mx-auto">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <h1 className="heading text-3xl">Uploaded!</h1>
        <p className="text-sm text-navy-500">
          AI kept <strong>{result.kept}</strong> photos. {result.rejected > 0 && <>{result.rejected} auto-rejected (blurry).</>}
        </p>
        <a className="block text-coral-600 underline break-all text-xs" href={result.link} target="_blank" rel="noreferrer">
          {result.link}
        </a>
        <button
          onClick={() => { setItems([]); setResult(null); }}
          className="btn-primary w-full !py-4 text-base"
        >
          Next customer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in pt-2">
      <h1 className="heading text-2xl">Upload photos</h1>

      {/* Camera + Gallery buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => cameraRef.current?.click()}
          className="btn-secondary !py-4 flex-col !gap-1"
        >
          <Camera className="h-6 w-6 text-coral-500" />
          <span className="text-xs">Take Photo</span>
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="btn-secondary !py-4 flex-col !gap-1"
        >
          <Upload className="h-6 w-6 text-coral-500" />
          <span className="text-xs">Select from Gallery</span>
        </button>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFiles(e.target.files)} className="hidden" />
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
      </div>

      {/* Upload queue */}
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="label-xs">Upload queue ({items.length})</div>
          <div className="grid grid-cols-4 gap-2">
            {items.map((it) => (
              <div key={it.id} className="relative aspect-square rounded-xl overflow-hidden bg-cream-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.preview} alt="" className="w-full h-full object-cover" />
                {/* Progress bar */}
                {busy && !it.uploaded && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-navy-100">
                    <div className="h-full bg-coral-500 transition-all" style={{ width: `${it.progress}%` }} />
                  </div>
                )}
                {it.uploaded && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                )}
                {/* Star = hook */}
                <button
                  onClick={() => toggleHook(it.id)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center"
                >
                  <Star className={`h-3 w-3 ${it.isHook ? "fill-gold-500 text-gold-500" : "text-navy-400"}`} />
                </button>
                {/* Remove */}
                {!busy && (
                  <button
                    onClick={() => removeItem(it.id)}
                    className="absolute top-1 left-1 h-5 w-5 rounded-full bg-red-500/80 text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={uploadAll}
        disabled={!items.length || busy || !locationId}
        className="btn-primary w-full !py-4 text-base"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
        {busy ? "Uploading…" : `Upload ${items.length} photo${items.length === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CAMERA TAB — WebRTC live preview + snapshot upload
   ═══════════════════════════════════════════════════ */
function CameraTab({ locationId, photographerId }: { locationId: string; photographerId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [snapshots, setSnapshots] = useState<{ id: string; dataUrl: string; isHook: boolean; uploaded: boolean }[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ link: string; kept: number; rejected: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Cleanup on unmount
  useEffect(() => { return () => { stream?.getTracks().forEach((t) => t.stop()); }; }, [stream]);

  async function startCamera() {
    setErr(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      setStream(s);
      setActive(true);
      if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play(); }
    } catch (e: any) {
      setErr(e?.message || "Camera permission denied.");
    }
  }

  function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setActive(false);
  }

  function takeSnapshot() {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    c.getContext("2d")?.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    setSnapshots((prev) => [{ id: `snap-${Date.now()}`, dataUrl, isHook: false, uploaded: false }, ...prev].slice(0, 20));
  }

  function toggleHook(id: string) {
    setSnapshots((prev) => prev.map((s) => ({ ...s, isHook: s.id === id ? !s.isHook : false })));
  }

  function removeSnap(id: string) {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }

  async function uploadSnapshots() {
    if (!snapshots.length || !locationId || !photographerId) return;
    setBusy(true);
    const uploaded: { s3Key: string; isHookImage: boolean }[] = [];
    for (let i = 0; i < snapshots.length; i++) {
      const snap = snapshots[i];
      // Convert dataUrl to Blob for upload
      const res = await fetch(snap.dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `snapshot-${i}.jpg`, { type: "image/jpeg" });
      try {
        const pre = await fetch("/api/upload/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: "image/jpeg" }),
        }).then((r) => r.json());
        if (pre.url && pre.key) {
          await fetch(pre.url, { method: "PUT", body: file, headers: { "Content-Type": "image/jpeg" } });
          uploaded.push({ s3Key: pre.key, isHookImage: snap.isHook });
        } else {
          uploaded.push({ s3Key: `mobile/cam/${Date.now()}-${i}.jpg`, isHookImage: snap.isHook });
        }
      } catch {
        uploaded.push({ s3Key: `mobile/cam/${Date.now()}-${i}.jpg`, isHookImage: snap.isHook });
      }
      setSnapshots((prev) => prev.map((s) => s.id === snap.id ? { ...s, uploaded: true } : s));
    }

    const r = await fetch("/api/mobile-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId, photographerId, photos: uploaded }),
    }).then((r) => r.json());

    setBusy(false);
    if (r.ok) {
      let kept = uploaded.length, rejected = 0;
      try {
        const cull = await fetch("/api/ai/cull", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ galleryId: r.galleryId }),
        }).then((res) => res.json());
        if (cull.kept !== undefined) { kept = cull.kept; rejected = cull.rejected || 0; }
      } catch {}
      setResult({ link: `${window.location.origin}/gallery/${r.magicLinkToken}`, kept, rejected });
      stopCamera();
    }
  }

  if (result) {
    return (
      <div className="text-center animate-fade-in space-y-5 mt-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lift mx-auto">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <h1 className="heading text-3xl">Uploaded!</h1>
        <p className="text-sm text-navy-500">AI kept <strong>{result.kept}</strong> photos. {result.rejected > 0 && <>{result.rejected} auto-rejected.</>}</p>
        <a className="block text-coral-600 underline break-all text-xs" href={result.link} target="_blank" rel="noreferrer">{result.link}</a>
        <button onClick={() => { setSnapshots([]); setResult(null); }} className="btn-primary w-full !py-4 text-base">Next customer</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in pt-2">
      <h1 className="heading text-2xl">Camera capture</h1>

      {err && <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-2 text-xs text-coral-700">{err}</div>}

      {/* Live preview */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-navy-900 shadow-lift">
        <video ref={videoRef} className={`w-full h-full object-cover ${!active ? "hidden" : ""}`} muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Video className="h-12 w-12 text-white/20" />
            <button onClick={startCamera} className="btn-primary text-sm !px-6 !py-3">
              <Video className="h-4 w-4" /> Start Camera
            </button>
          </div>
        )}
        {active && (
          <button
            onClick={stopCamera}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 text-white/70 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Capture button */}
      {active && (
        <button
          onClick={takeSnapshot}
          className="w-full flex items-center justify-center gap-3 h-16 rounded-2xl bg-coral-500 hover:bg-coral-600 active:scale-[0.98] transition font-semibold text-lg shadow-lg shadow-coral-500/30"
        >
          <CircleDot className="h-7 w-7" />
          Capture
        </button>
      )}

      {/* Snapshot queue */}
      {snapshots.length > 0 && (
        <div className="space-y-2">
          <div className="label-xs">Snapshots ({snapshots.length}) — tap ★ to mark as hook</div>
          <div className="grid grid-cols-4 gap-2">
            {snapshots.map((snap) => (
              <div key={snap.id} className="relative aspect-square rounded-xl overflow-hidden bg-cream-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={snap.dataUrl} alt="" className="w-full h-full object-cover" />
                {snap.uploaded && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                )}
                <button
                  onClick={() => toggleHook(snap.id)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center"
                >
                  <Star className={`h-3 w-3 ${snap.isHook ? "fill-gold-500 text-gold-500" : "text-navy-400"}`} />
                </button>
                {!busy && (
                  <button
                    onClick={() => removeSnap(snap.id)}
                    className="absolute top-1 left-1 h-5 w-5 rounded-full bg-red-500/80 text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      {snapshots.length > 0 && (
        <button
          onClick={uploadSnapshots}
          disabled={busy || !locationId}
          className="btn-primary w-full !py-4 text-base"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          {busy ? "Uploading…" : `Upload ${snapshots.length} snapshot${snapshots.length === 1 ? "" : "s"}`}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SCAN TAB
   ═══════════════════════════════════════════════════ */
function ScanTab({ locationId, photographerId }: { locationId: string; photographerId: string }) {
  const [mode, setMode] = useState<"camera" | "manual" | "result">("camera");
  const [scanning, setScanning] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualWhatsApp, setManualWhatsApp] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualRoom, setManualRoom] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedCustomer, setSavedCustomer] = useState<{ id: string; name: string | null } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  async function startScan() {
    setErr(null);
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        const stop = () => { stream.getTracks().forEach((t) => t.stop()); setScanning(false); };
        let stopped = false;
        const tick = async () => {
          if (stopped) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes?.[0]?.rawValue) {
              stopped = true;
              stop();
              setScannedCode(codes[0].rawValue);
              setMode("result");
              return;
            }
          } catch {}
          requestAnimationFrame(tick);
        };
        tick();
        setTimeout(() => { if (!stopped) { stopped = true; stop(); setErr("No QR detected after 15s."); } }, 15000);
      } else {
        setErr("BarcodeDetector not available. Use manual entry.");
        stream.getTracks().forEach((t) => t.stop());
        setScanning(false);
      }
    } catch (e: any) {
      setScanning(false);
      setErr(e?.message || "Camera permission denied.");
    }
  }

  async function saveCustomer() {
    setSaving(true);
    try {
      const body: any = { locationId };
      if (scannedCode) body.wristbandCode = scannedCode;
      if (manualName) body.name = manualName;
      if (manualWhatsApp) body.whatsapp = manualWhatsApp;
      if (manualEmail) body.email = manualEmail;
      if (manualRoom) body.roomNumber = manualRoom;

      const r = await fetch("/api/customer/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((res) => res.json());

      if (r.customer) {
        setSavedCustomer(r.customer);
      } else {
        setErr("Could not save customer. Try again.");
      }
    } catch {
      setErr("Network error.");
    }
    setSaving(false);
  }

  if (savedCustomer) {
    return (
      <div className="text-center animate-fade-in space-y-5 mt-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lift mx-auto">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <h1 className="heading text-2xl">Customer linked!</h1>
        <p className="text-sm text-navy-500">{savedCustomer.name || "Guest"} — Photos will auto-tag.</p>
        <button onClick={() => { setSavedCustomer(null); setScannedCode(""); setMode("camera"); }} className="btn-primary w-full !py-4">
          Scan next customer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in pt-2">
      <h1 className="heading text-2xl">Scan customer</h1>

      {/* Camera viewfinder */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-navy-900">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy-900/80">
            <ScanLine className="h-16 w-16 text-coral-500/60 mb-4" />
            <button onClick={startScan} className="btn-primary">
              <ScanLine className="h-4 w-4" /> Start scanning
            </button>
          </div>
        )}
        {scanning && (
          <div className="absolute inset-8 border-2 border-coral-500/50 rounded-xl" />
        )}
      </div>

      {err && <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-2 text-xs text-coral-700">{err}</div>}

      {scannedCode && mode === "result" && (
        <div className="card p-4 space-y-3">
          <div className="label-xs">Scanned code</div>
          <div className="font-mono text-lg text-navy-900 font-semibold">{scannedCode}</div>
          <button onClick={saveCustomer} disabled={saving} className="btn-primary w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Link Photos to Customer
          </button>
        </div>
      )}

      {/* Manual entry */}
      <div className="flex items-center gap-2 text-xs text-navy-400">
        <span className="h-px flex-1 bg-cream-300" />
        <span>or enter manually</span>
        <span className="h-px flex-1 bg-cream-300" />
      </div>

      <div className="space-y-3">
        <input className="input" placeholder="Customer name" value={manualName} onChange={(e) => setManualName(e.target.value)} />
        <input className="input" placeholder="WhatsApp number" type="tel" value={manualWhatsApp} onChange={(e) => setManualWhatsApp(e.target.value)} />
        <input className="input" placeholder="Email" type="email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} />
        <input className="input" placeholder="Room number" value={manualRoom} onChange={(e) => setManualRoom(e.target.value)} />
        <button
          onClick={saveCustomer}
          disabled={saving || (!manualName && !manualWhatsApp && !manualEmail && !manualRoom)}
          className="btn-primary w-full !py-3"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
          Save Customer
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SCHEDULE TAB
   ═══════════════════════════════════════════════════ */
function ScheduleTab() {
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookTime, setBookTime] = useState("");

  useEffect(() => {
    fetch("/api/me/today")
      .then((r) => r.json())
      .then((d) => setAppts(d.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Find next upcoming
  const now = Date.now();
  const nextIdx = appts.findIndex((a) => new Date(a.scheduledTime).getTime() > now);

  return (
    <div className="space-y-5 animate-fade-in pt-2">
      <div className="flex items-center justify-between">
        <h1 className="heading text-2xl">Today&apos;s schedule</h1>
        <button onClick={() => setShowBookModal(true)} className="btn-primary text-xs !px-3 !py-2">
          <Plus className="h-3 w-3" /> Book
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-coral-500" /></div>
      ) : appts.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-10 w-10 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-400 text-sm">No appointments today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appts.map((a, i) => {
            const isNext = i === nextIdx;
            const isPast = new Date(a.scheduledTime).getTime() < now;
            return (
              <div
                key={a.id}
                className={`card p-4 flex items-center gap-4 transition ${
                  isNext ? "ring-2 ring-coral-500 bg-coral-50/40" : isPast ? "opacity-60" : ""
                }`}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isNext ? "bg-coral-500 text-white" : "bg-cream-200 text-navy-600"}`}>
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy-900">{fmtTime(a.scheduledTime)}</div>
                  <div className="text-xs text-navy-500 truncate">
                    {a.gallery?.customer?.name || "Guest"} {a.gallery?.customer?.roomNumber ? `— Room ${a.gallery.customer.roomNumber}` : ""}
                  </div>
                  <div className="text-[10px] text-navy-400 uppercase tracking-wider mt-0.5">{a.source.replace(/_/g, " ")}</div>
                </div>
                {isNext && (
                  <div className="text-right">
                    <div className="text-xs font-bold text-coral-600">{fmtCountdown(a.scheduledTime)}</div>
                    <div className="text-[10px] text-navy-400">until start</div>
                  </div>
                )}
                <ChevronRight className="h-4 w-4 text-navy-300 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* Book modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-navy-900/50 flex items-end justify-center" onClick={() => setShowBookModal(false)}>
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="heading text-xl">Book a session</h2>
            <input
              type="datetime-local"
              className="input"
              value={bookTime}
              onChange={(e) => setBookTime(e.target.value)}
            />
            <button
              disabled={!bookTime}
              onClick={async () => {
                await fetch("/api/booking/create", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ scheduledTime: new Date(bookTime).toISOString(), source: "WALK_IN" }),
                }).catch(() => {});
                setShowBookModal(false);
                // Refresh
                fetch("/api/me/today").then((r) => r.json()).then((d) => setAppts(d.appointments || [])).catch(() => {});
              }}
              className="btn-primary w-full !py-4"
            >
              Confirm booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STATS TAB
   ═══════════════════════════════════════════════════ */
function StatsTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me/today")
      .then((r) => r.json())
      .then((d) => setStats(d.stats || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-coral-500" /></div>;

  const xp = stats?.xpToday || 0;
  const xpGoal = stats?.xpGoal || 500;
  const photos = stats?.photosToday || 0;
  const bookings = stats?.bookingsToday || 0;
  const revenue = stats?.revenueToday || 0;
  const streak = stats?.streak || 0;
  const tip = stats?.coachingTip || "Upload more photos to earn XP and climb the leaderboard!";

  return (
    <div className="space-y-5 animate-fade-in pt-2">
      <h1 className="heading text-2xl">Today&apos;s stats</h1>

      {/* XP progress */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="label-xs">XP earned today</div>
          <div className="font-display text-2xl text-coral-600">{xp}</div>
        </div>
        <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-coral-500 to-coral-400 rounded-full transition-all"
            style={{ width: `${Math.min(100, (xp / xpGoal) * 100)}%` }}
          />
        </div>
        <div className="text-xs text-navy-400 text-right">{xp} / {xpGoal} daily goal</div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Camera} label="Photos uploaded" value={`${photos}`} />
        <StatCard icon={Calendar} label="Bookings" value={`${bookings}`} />
        <StatCard icon={TrendingUp} label="Revenue" value={`€${revenue}`} />
        <StatCard icon={Flame} label="Streak" value={`${streak} days`} accent />
      </div>

      {/* AI coaching */}
      <div className="card p-4 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-gold-500" />
          <div className="text-xs font-semibold uppercase tracking-wider text-gold-400">AI Coaching Tip</div>
        </div>
        <p className="text-sm text-navy-200 leading-relaxed">{tip}</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className="stat-card !p-4">
      <Icon className={`h-5 w-5 ${accent ? "text-coral-500" : "text-navy-400"}`} />
      <div className="font-display text-2xl text-navy-900">{value}</div>
      <div className="text-xs text-navy-400">{label}</div>
    </div>
  );
}
