"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MatchResult {
  photoId: string;
  galleryId: string;
  confidence: number;
  thumbnailUrl: string;
}

interface SelfieCameraProps {
  locationId: string;
  galleryId?: string;
  onResults: (results: MatchResult[]) => void;
  onClose: () => void;
}

type Stage =
  | "CONSENT"
  | "CAMERA"
  | "COUNTDOWN"
  | "SEARCHING"
  | "RESULTS"
  | "ERROR";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SelfieCamera({
  locationId,
  galleryId,
  onResults,
  onClose,
}: SelfieCameraProps) {
  const [stage, setStage] = useState<Stage>("CONSENT");
  const [consented, setConsented] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /* ---- Camera lifecycle ------------------------------------------ */

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStage("CAMERA");
    } catch {
      setErrorMsg(
        "Camera access required. Please allow camera access in your browser settings."
      );
      setStage("ERROR");
    }
  }, []);

  // Clean up stream on unmount
  useEffect(() => stopCamera, [stopCamera]);

  /* ---- Capture ----------------------------------------------------- */

  function captureFrame(): string | null {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Mirror horizontally to match the preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  }

  /* ---- Countdown --------------------------------------------------- */

  function beginCountdown() {
    setStage("COUNTDOWN");
    setCountdown(3);

    let n = 3;
    const tick = () => {
      n -= 1;
      if (n > 0) {
        setCountdown(n);
        setTimeout(tick, 1000);
      } else {
        // Capture
        const data = captureFrame();
        stopCamera();
        if (!data) {
          setErrorMsg("Failed to capture image. Please try again.");
          setStage("ERROR");
          return;
        }
        setCapturedImage(data);
        setStage("SEARCHING");
        searchFaces(data);
      }
    };
    setTimeout(tick, 1000);
  }

  /* ---- API search -------------------------------------------------- */

  async function searchFaces(selfieBase64: string) {
    try {
      const res = await fetch("/api/face/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfieBase64, locationId, galleryId }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const results: MatchResult[] = Array.isArray(data.matches)
        ? data.matches
        : [];
      setMatches(results.sort((a, b) => b.confidence - a.confidence));
      setStage("RESULTS");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStage("ERROR");
    }
  }

  /* ---- Navigation helpers ----------------------------------------- */

  function tryAgain() {
    setCapturedImage(null);
    setMatches([]);
    setErrorMsg("");
    startCamera();
  }

  /* ---- Render ------------------------------------------------------ */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Close button (always visible) */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* ── CONSENT ────────────────────────────────────────────── */}
        {stage === "CONSENT" && (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0EA5A5]/10">
              <Camera size={32} className="text-[#0EA5A5]" />
            </div>

            <h2 className="font-display text-2xl font-bold text-[#0C2E3D]">
              Find Your Photos
            </h2>

            <p className="mt-3 max-w-sm font-sans text-sm text-gray-600 leading-relaxed">
              We&apos;ll take a quick selfie to find photos of you. Your selfie
              is deleted immediately after matching &mdash; we never store it.
            </p>

            <label className="mt-6 flex cursor-pointer items-start gap-3 text-left">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#0EA5A5] accent-[#0EA5A5] focus:ring-[#0EA5A5]"
              />
              <span className="font-sans text-sm text-gray-700">
                I consent to face recognition for photo matching
              </span>
            </label>

            <button
              disabled={!consented}
              onClick={startCamera}
              className="mt-6 w-full max-w-xs rounded-xl bg-[#F97316] px-6 py-3 font-sans font-semibold text-white transition-all hover:bg-[#ea6c10] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Open Camera
            </button>

            <p className="mt-4 font-sans text-xs text-gray-400">
              GDPR compliant &bull; Selfie deleted after search &bull; No data
              stored
            </p>
          </div>
        )}

        {/* ── CAMERA ─────────────────────────────────────────────── */}
        {stage === "CAMERA" && (
          <div className="flex flex-col">
            <div className="relative aspect-[4/3] w-full bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              {/* Oval guide overlay */}
              <FaceGuide />
            </div>

            <div className="flex items-center justify-center gap-4 bg-[#0C2E3D] px-6 py-4">
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="rounded-xl border border-white/30 px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={beginCountdown}
                className="flex items-center gap-2 rounded-xl bg-[#F97316] px-8 py-2.5 font-sans font-semibold text-white transition-all hover:bg-[#ea6c10]"
              >
                <Camera size={18} />
                Take Photo
              </button>
            </div>
          </div>
        )}

        {/* ── COUNTDOWN ──────────────────────────────────────────── */}
        {stage === "COUNTDOWN" && (
          <div className="flex flex-col">
            <div className="relative aspect-[4/3] w-full bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              {/* Large countdown number */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  key={countdown}
                  className="animate-ping-once font-display text-8xl font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                >
                  {countdown}
                </span>
              </div>
            </div>
            <div className="bg-[#0C2E3D] px-6 py-4 text-center">
              <p className="font-sans text-sm text-white/70">
                Hold still...
              </p>
            </div>
          </div>
        )}

        {/* ── SEARCHING ──────────────────────────────────────────── */}
        {stage === "SEARCHING" && (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            {capturedImage && (
              <div className="mb-6 h-24 w-24 overflow-hidden rounded-full border-4 border-[#0EA5A5]/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={capturedImage}
                  alt="Your selfie"
                  className="h-full w-full object-cover blur-[2px]"
                />
              </div>
            )}

            <Loader2
              size={40}
              className="mb-4 animate-spin text-[#0EA5A5]"
            />

            <h2 className="font-display text-xl font-bold text-[#0C2E3D]">
              Searching for your photos...
            </h2>

            <p className="mt-2 font-sans text-sm text-gray-500">
              This usually takes 2&ndash;3 seconds
            </p>
          </div>
        )}

        {/* ── RESULTS ────────────────────────────────────────────── */}
        {stage === "RESULTS" && (
          <div className="px-6 py-8">
            {matches.length > 0 ? (
              <>
                <div className="mb-6 flex items-center justify-center gap-2 text-center">
                  <Sparkles size={24} className="text-[#F97316]" />
                  <h2 className="font-display text-xl font-bold text-[#0C2E3D]">
                    We found {matches.length} photo
                    {matches.length !== 1 ? "s" : ""} of you!
                  </h2>
                </div>

                <div className="mb-6 grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                  {matches.map((m) => (
                    <div
                      key={m.photoId}
                      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.thumbnailUrl}
                        alt="Matched photo"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <span className="absolute bottom-1 right-1 rounded-md bg-[#0EA5A5]/90 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-white">
                        {Math.round(m.confidence * 100)}% match
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => onResults(matches)}
                    className="flex-1 rounded-xl bg-[#F97316] px-6 py-3 font-sans font-semibold text-white transition-all hover:bg-[#ea6c10]"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle size={18} />
                      Show These Photos
                    </span>
                  </button>
                  <button
                    onClick={tryAgain}
                    className="flex-1 rounded-xl border border-gray-300 px-6 py-3 font-sans text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Try Again
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <Camera size={28} className="text-gray-400" />
                </div>

                <h2 className="font-display text-xl font-bold text-[#0C2E3D]">
                  No photos found
                </h2>
                <p className="mt-2 max-w-xs font-sans text-sm text-gray-500">
                  We couldn&apos;t find your photos. Try again or use a room
                  number instead.
                </p>

                <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
                  <button
                    onClick={tryAgain}
                    className="flex-1 rounded-xl bg-[#F97316] px-6 py-3 font-sans font-semibold text-white transition-all hover:bg-[#ea6c10]"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => onClose()}
                    className="flex-1 rounded-xl border border-gray-300 px-6 py-3 font-sans text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ERROR ──────────────────────────────────────────────── */}
        {stage === "ERROR" && (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle size={28} className="text-red-500" />
            </div>

            <h2 className="font-display text-xl font-bold text-[#0C2E3D]">
              Oops
            </h2>

            <p className="mt-2 max-w-xs font-sans text-sm text-gray-600">
              {errorMsg}
            </p>

            <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                onClick={tryAgain}
                className="rounded-xl bg-[#F97316] px-6 py-3 font-sans font-semibold text-white transition-all hover:bg-[#ea6c10]"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="rounded-xl border border-gray-300 px-6 py-3 font-sans text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Countdown pulse animation (inline keyframe via style tag) */}
      <style jsx global>{`
        @keyframes ping-once {
          0% {
            opacity: 1;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
        }
        .animate-ping-once {
          animation: ping-once 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Face Guide Overlay                                                 */
/* ------------------------------------------------------------------ */

function FaceGuide() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      {/* Semi-transparent dark overlay with oval cutout */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 640 480"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <mask id="oval-mask">
            <rect width="640" height="480" fill="white" />
            <ellipse cx="320" cy="220" rx="120" ry="160" fill="black" />
          </mask>
        </defs>
        {/* Dark overlay outside the oval */}
        <rect
          width="640"
          height="480"
          fill="rgba(0,0,0,0.45)"
          mask="url(#oval-mask)"
        />
        {/* Oval border */}
        <ellipse
          cx="320"
          cy="220"
          rx="120"
          ry="160"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="2.5"
          strokeDasharray="8 4"
        />
      </svg>

      {/* Guide text below the oval */}
      <p className="absolute bottom-[20%] font-sans text-sm font-medium text-white/80 drop-shadow-md">
        Position your face in the oval
      </p>
    </div>
  );
}
