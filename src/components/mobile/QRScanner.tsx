"use client";
import { useState } from "react";
import { ScanLine, Keyboard } from "lucide-react";

/**
 * Lightweight QR scanner. In a real PWA you would call BarcodeDetector
 * (Chrome) or fall back to a library like html5-qrcode. To keep this self-
 * contained and avoid extra dependencies, we expose:
 *   - a manual text input that always works
 *   - a "Scan with camera" button that uses BarcodeDetector if available
 */
export default function QRScanner({ onResult }: { onResult: (code: string) => void }) {
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function scanWithCamera() {
    setErr(null);
    if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
      setErr("BarcodeDetector not available in this browser. Use the manual field.");
      return;
    }
    try {
      setBusy(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      // @ts-ignore — BarcodeDetector is not in TS lib yet in all versions
      const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
      const stop = () => stream.getTracks().forEach((t) => t.stop());
      const tick = async () => {
        const codes = await detector.detect(video);
        if (codes && codes[0]?.rawValue) {
          stop();
          setBusy(false);
          onResult(codes[0].rawValue);
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
      setTimeout(() => {
        stop();
        setBusy(false);
        setErr("No QR code detected after 10s.");
      }, 10000);
    } catch (e: any) {
      setBusy(false);
      setErr(e?.message || "Camera permission denied.");
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={scanWithCamera} disabled={busy} className="btn-primary w-full !py-4 text-base">
        <ScanLine className="h-5 w-5" />
        {busy ? "Scanning…" : "Scan QR with camera"}
      </button>
      {err && (
        <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-2 text-xs text-coral-700">{err}</div>
      )}
      <div className="flex items-center gap-2 text-xs text-navy-400">
        <span className="h-px flex-1 bg-cream-300" />
        <span>or enter manually</span>
        <span className="h-px flex-1 bg-cream-300" />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) onResult(manual.trim());
        }}
        className="flex gap-2"
      >
        <div className="flex-1 relative">
          <Keyboard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
          <input
            className="input pl-10"
            placeholder="QR-WRIST-AQUA-001"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-secondary">
          OK
        </button>
      </form>
    </div>
  );
}
