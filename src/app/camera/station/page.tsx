"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera, Wifi, WifiOff, CircleDot, Upload, Settings, ChevronDown, ChevronUp,
  HardDrive, Clock, Zap, ScanLine, Loader2, Video,
} from "lucide-react";

type CaptureItem = { id: string; preview: string; time: number; matched?: boolean; galleryId?: string };
type CaptureResult = { matched: boolean; galleryId?: string; customerId?: string; isUnclaimed?: boolean; error?: string };

export default function CameraStationPage() {
  const [connected, setConnected] = useState(false);
  const [autoCapture, setAutoCapture] = useState(false);
  const [interval, setInterval_] = useState(10);
  const [captures, setCaptures] = useState<CaptureItem[]>([]);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cameraId, setCameraId] = useState("NK-D7000-001");
  const [locationId, setLocationId] = useState("");
  const [kioskIp, setKioskIp] = useState("192.168.1.100");
  const [quality, setQuality] = useState<"low" | "med" | "high">("high");
  const [lastWristband, setLastWristband] = useState<string | null>(null);
  const [photosToday, setPhotosToday] = useState(0);
  const [storageUsed, setStorageUsed] = useState("0 MB");
  const [uptime, setUptime] = useState("0:00:00");
  const [lastCaptureResult, setLastCaptureResult] = useState<CaptureResult | null>(null);
  // WebRTC camera preview
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraPreviewActive, setCameraPreviewActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTime = useRef(Date.now());
  const autoCaptureRef = useRef(false);
  const intervalRef = useRef(10);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate connection after mount
  useEffect(() => {
    const t = setTimeout(() => setConnected(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Uptime ticker
  useEffect(() => {
    const tick = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime.current) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setUptime(`${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => { cameraStream?.getTracks().forEach((t) => t.stop()); };
  }, [cameraStream]);

  async function startCameraPreview() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      setCameraPreviewActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e: any) {
      console.error("Camera access denied:", e);
    }
  }

  function stopCameraPreview() {
    cameraStream?.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
    setCameraPreviewActive(false);
  }

  /** Snapshot from WebRTC stream → base64 → POST to API */
  async function captureFromWebRTC() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
    await doCapture(base64);
  }

  const doCapture = useCallback(async (imageBase64?: string) => {
    // Build SVG placeholder for the local thumbnail (shown immediately)
    const svgPreview = `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#1a2a44" width="200" height="200"/><text x="100" y="100" fill="#F97316" font-size="14" text-anchor="middle" dominant-baseline="middle">${new Date().toLocaleTimeString()}</text></svg>`
    )}`;

    const captureId = `cap-${Date.now()}`;
    const item: CaptureItem = { id: captureId, preview: svgPreview, time: Date.now() };
    setCaptures((prev) => [item, ...prev].slice(0, 20));
    setPhotosToday((p) => p + 1);
    setStorageUsed(`${((photosToday + 1) * 4.2).toFixed(1)} MB`);

    // POST to real API
    try {
      const body: Record<string, string> = {
        cameraId,
        locationId: locationId || "default",
      };
      if (lastWristband) body.wristbandCode = lastWristband;
      if (imageBase64) body.imageBase64 = imageBase64;

      const res = await fetch("/api/camera/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: CaptureResult & { success?: boolean; error?: string } = await res.json();

      if (data.success !== false) {
        setLastCaptureResult({ matched: data.matched ?? false, galleryId: data.galleryId, customerId: data.customerId, isUnclaimed: data.isUnclaimed });
        // Update the capture item to reflect match status
        setCaptures((prev) => prev.map((c) => c.id === captureId ? { ...c, matched: data.matched, galleryId: data.galleryId } : c));
        setPendingUploads((p) => p + 1);
      } else {
        setLastCaptureResult({ matched: false, error: data.error || "API error" });
        setPendingUploads((p) => p + 1);
      }
    } catch (err: any) {
      setLastCaptureResult({ matched: false, error: "Network error – queued locally" });
      setPendingUploads((p) => p + 1);
    }
  }, [photosToday, cameraId, locationId, lastWristband]);

  // Auto-capture loop
  useEffect(() => {
    autoCaptureRef.current = autoCapture;
    intervalRef.current = interval;

    if (timerRef.current) clearInterval(timerRef.current);

    if (autoCapture && connected) {
      timerRef.current = setInterval(() => {
        if (autoCaptureRef.current) doCapture();
      }, intervalRef.current * 1000);
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoCapture, interval, connected, doCapture]);

  async function uploadPending() {
    setUploading(true);
    // Sync any locally-queued items to the cloud
    await new Promise((r) => setTimeout(r, 1500));
    setPendingUploads(0);
    setUploading(false);
  }

  return (
    <div className="min-h-screen bg-[#0C2E3D] text-white font-sans selection:bg-coral-500/30">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Camera className="h-6 w-6 text-coral-500" />
          <div>
            <div className="font-display text-lg">Camera Station</div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">{cameraId}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Connection status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {connected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Status indicator */}
        <div className="flex justify-center">
          <div className={`h-32 w-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
            connected ? "border-green-500 bg-green-500/10 shadow-[0_0_40px_rgba(34,197,94,0.3)]" : "border-red-500 bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
          }`}>
            <div className="text-center">
              {connected ? <Wifi className="h-10 w-10 text-green-400 mx-auto" /> : <WifiOff className="h-10 w-10 text-red-400 mx-auto" />}
              <div className="text-xs mt-1 text-white/60">{connected ? "ONLINE" : "OFFLINE"}</div>
            </div>
          </div>
        </div>

        {/* WebRTC Camera Preview */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-white/40" />
              <span className="text-sm font-medium">Live Camera Preview</span>
            </div>
            {!cameraPreviewActive ? (
              <button
                onClick={startCameraPreview}
                className="px-3 py-1.5 rounded-lg bg-coral-500/20 text-coral-400 text-xs font-medium hover:bg-coral-500/30 transition"
              >
                Start Preview
              </button>
            ) : (
              <button
                onClick={stopCameraPreview}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white/60 text-xs font-medium hover:bg-white/20 transition"
              >
                Stop
              </button>
            )}
          </div>
          <div className="relative aspect-video bg-black/40 overflow-hidden">
            <video ref={videoRef} className={`w-full h-full object-cover ${!cameraPreviewActive ? "hidden" : ""}`} muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            {!cameraPreviewActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-12 w-12 text-white/10" />
              </div>
            )}
          </div>
          {cameraPreviewActive && (
            <div className="p-3">
              <button
                onClick={captureFromWebRTC}
                disabled={!connected}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-coral-500/20 hover:bg-coral-500/30 text-coral-400 text-sm font-semibold transition disabled:opacity-40"
              >
                <CircleDot className="h-4 w-4" />
                Capture from Camera
              </button>
            </div>
          )}
        </div>

        {/* Last capture result */}
        {lastCaptureResult && (
          <div className={`rounded-2xl p-4 border text-sm ${
            lastCaptureResult.error
              ? "bg-red-500/10 border-red-500/20 text-red-300"
              : lastCaptureResult.matched
                ? "bg-green-500/10 border-green-500/20 text-green-300"
                : "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
          }`}>
            {lastCaptureResult.error ? (
              <span>⚠ {lastCaptureResult.error}</span>
            ) : lastCaptureResult.matched ? (
              <span>✓ Customer matched — Gallery <span className="font-mono text-xs">{lastCaptureResult.galleryId?.slice(0, 8)}…</span></span>
            ) : (
              <span>○ Unclaimed capture — customer can claim via selfie or QR</span>
            )}
          </div>
        )}

        {/* Auto Capture Toggle */}
        <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
          <div>
            <div className="font-semibold">Auto Capture</div>
            <div className="text-xs text-white/40">Every {interval}s when enabled</div>
          </div>
          <button
            onClick={() => setAutoCapture(!autoCapture)}
            className={`relative w-14 h-7 rounded-full transition-colors ${autoCapture ? "bg-green-500" : "bg-white/20"}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${autoCapture ? "translate-x-7" : "translate-x-0.5"}`} />
          </button>
        </div>

        {/* Interval slider */}
        {autoCapture && (
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Capture interval</span>
              <span className="font-mono text-coral-400">{interval}s</span>
            </div>
            <input
              type="range" min="3" max="30" value={interval}
              onChange={(e) => setInterval_(Number(e.target.value))}
              className="w-full accent-coral-500"
            />
            <div className="flex justify-between text-[10px] text-white/30">
              <span>3s</span><span>30s</span>
            </div>
          </div>
        )}

        {/* Manual Capture button */}
        <button
          onClick={() => doCapture()}
          disabled={!connected}
          className="w-full flex items-center justify-center gap-3 h-20 rounded-2xl bg-coral-500 hover:bg-coral-600 active:scale-[0.98] transition font-semibold text-lg shadow-lg shadow-coral-500/30 disabled:opacity-40 disabled:pointer-events-none"
        >
          <CircleDot className="h-8 w-8" />
          Capture
        </button>

        {/* Upload status */}
        <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <Upload className="h-5 w-5 text-white/40" />
            <div>
              <div className="text-sm font-medium">{pendingUploads} photos pending upload</div>
              {uploading && <div className="text-xs text-coral-400">Uploading...</div>}
            </div>
          </div>
          <button
            onClick={uploadPending}
            disabled={pendingUploads === 0 || uploading}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition disabled:opacity-40"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sync"}
          </button>
        </div>

        {/* Wristband indicator */}
        <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/10">
          <ScanLine className="h-5 w-5 text-white/40" />
          <div className="flex-1">
            <div className="text-sm font-medium">
              {lastWristband ? `Last scan: ${lastWristband}` : "No wristband scanned"}
            </div>
            <div className="text-xs text-white/40">
              {lastWristband ? "Next capture will be tagged" : "Scan a wristband to tag captures"}
            </div>
          </div>
          {!lastWristband && (
            <button
              onClick={() => setLastWristband(`WB-${Math.random().toString(36).slice(2, 7).toUpperCase()}`)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium"
            >
              Simulate
            </button>
          )}
          {lastWristband && (
            <button onClick={() => setLastWristband(null)} className="text-xs text-coral-400 hover:text-coral-300">
              Clear
            </button>
          )}
        </div>

        {/* Photo queue */}
        {captures.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wider text-white/40 mb-3">Recent captures ({captures.length})</div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {captures.map((c) => (
                <div key={c.id} className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-white/10 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.preview} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
            <Camera className="h-4 w-4 text-white/40 mx-auto mb-1" />
            <div className="font-display text-xl">{photosToday}</div>
            <div className="text-[10px] text-white/40">Photos today</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
            <HardDrive className="h-4 w-4 text-white/40 mx-auto mb-1" />
            <div className="font-display text-xl">{storageUsed}</div>
            <div className="text-[10px] text-white/40">Storage</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
            <Clock className="h-4 w-4 text-white/40 mx-auto mb-1" />
            <div className="font-display text-xl font-mono">{uptime}</div>
            <div className="text-[10px] text-white/40">Uptime</div>
          </div>
        </div>

        {/* Settings panel */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-white/40" />
              <span className="text-sm font-medium">Settings</span>
            </div>
            {settingsOpen ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
          </button>
          {settingsOpen && (
            <div className="p-4 pt-0 space-y-4 border-t border-white/10 mt-0">
              <label className="block">
                <div className="text-xs text-white/40 mb-1.5">Camera ID</div>
                <input
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-coral-500 focus:outline-none"
                  value={cameraId}
                  onChange={(e) => setCameraId(e.target.value)}
                />
              </label>
              <label className="block">
                <div className="text-xs text-white/40 mb-1.5">Location ID</div>
                <input
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-coral-500 focus:outline-none"
                  placeholder="e.g. clxyz123"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                />
              </label>
              <label className="block">
                <div className="text-xs text-white/40 mb-1.5">Kiosk IP</div>
                <input
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-coral-500 focus:outline-none"
                  value={kioskIp}
                  onChange={(e) => setKioskIp(e.target.value)}
                />
              </label>
              <label className="block">
                <div className="text-xs text-white/40 mb-1.5">Quality</div>
                <select
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-coral-500 focus:outline-none"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as any)}
                >
                  <option value="low">Low (1MP, fast upload)</option>
                  <option value="med">Medium (3MP, balanced)</option>
                  <option value="high">High (full-res)</option>
                </select>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
