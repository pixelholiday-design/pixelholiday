"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Wand2, Loader2, Sun, Snowflake, Sparkles, User, Zap } from "lucide-react";

type Preset = "auto" | "warm" | "cool" | "vibrant" | "portrait";

interface PresetOption {
  key: Preset;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const PRESETS: PresetOption[] = [
  { key: "auto", label: "Auto", icon: <Zap className="h-4 w-4" />, description: "Smart enhancement" },
  { key: "warm", label: "Warm", icon: <Sun className="h-4 w-4" />, description: "Golden tones" },
  { key: "cool", label: "Cool", icon: <Snowflake className="h-4 w-4" />, description: "Blue undertones" },
  { key: "vibrant", label: "Vibrant", icon: <Sparkles className="h-4 w-4" />, description: "Rich saturation" },
  { key: "portrait", label: "Portrait", icon: <User className="h-4 w-4" />, description: "Skin-optimized" },
];

interface Props {
  photoId: string;
  cloudinaryId: string | null;
  galleryToken: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function RetouchModal({ photoId, cloudinaryId, galleryToken, isOpen, onClose }: Props) {
  const [preset, setPreset] = useState<Preset>("auto");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const fetchPreview = useCallback(async (selectedPreset: Preset) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/gallery/${galleryToken}/retouch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, preset: selectedPreset }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate preview");
        return;
      }
      setPreviewUrl(data.previewUrl);
      setOriginalUrl(data.originalUrl);
      setPrice(data.price);
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [galleryToken, photoId]);

  useEffect(() => {
    if (isOpen) {
      fetchPreview(preset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handlePresetChange(p: Preset) {
    setPreset(p);
    fetchPreview(p);
  }

  async function handlePurchase() {
    setPurchasing(true);
    setError(null);
    try {
      const res = await fetch(`/api/gallery/${galleryToken}/retouch/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, preset }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start checkout");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setPurchasing(false);
    }
  }

  function handleSliderMove(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-navy-900/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lift max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-cream-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-coral-500" />
            <h3 className="font-display text-2xl text-navy-900">AI Enhancement</h3>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-cream-200 flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-navy-700" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Before/After Slider */}
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-navy-400 mb-2">
              Before / After
            </div>
            <div
              className="relative rounded-2xl overflow-hidden bg-navy-900 aspect-[4/3] cursor-col-resize select-none"
              onMouseMove={(e) => isDragging && handleSliderMove(e)}
              onMouseDown={(e) => {
                setIsDragging(true);
                handleSliderMove(e);
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchMove={handleSliderMove}
              onTouchStart={(e) => {
                setIsDragging(true);
                handleSliderMove(e);
              }}
              onTouchEnd={() => setIsDragging(false)}
            >
              {/* Original (full) */}
              {originalUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={originalUrl}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              )}

              {/* Enhanced (clipped) */}
              {previewUrl && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Enhanced"
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              )}

              {/* Slider line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full h-10 w-10 shadow-lg flex items-center justify-center">
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-4 bg-navy-400 rounded-full" />
                    <div className="w-0.5 h-4 bg-navy-400 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-3 left-3 bg-navy-900/70 text-white text-xs px-2 py-1 rounded-full z-10">
                Original
              </div>
              <div className="absolute top-3 right-3 bg-coral-500/90 text-white text-xs px-2 py-1 rounded-full z-10">
                Enhanced
              </div>

              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center z-20">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Loader2 className="h-5 w-5 animate-spin" /> Generating preview...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preset buttons */}
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-navy-400 mb-3">
              Enhancement Style
            </div>
            <div className="grid grid-cols-5 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handlePresetChange(p.key)}
                  disabled={loading}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition ${
                    preset === p.key
                      ? "border-coral-500 bg-coral-50 text-coral-700"
                      : "border-cream-300 bg-white text-navy-600 hover:border-coral-300 hover:bg-coral-50/50"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center ${
                      preset === p.key ? "bg-coral-500 text-white" : "bg-cream-200 text-navy-500"
                    }`}
                  >
                    {p.icon}
                  </div>
                  <span className="text-xs font-semibold">{p.label}</span>
                  <span className="text-[10px] text-navy-400 leading-tight hidden sm:block">
                    {p.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-3 bg-coral-50 border border-coral-200 text-coral-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-cream-300 bg-cream-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-navy-500 text-xs">
              AI enhancement is applied to a copy. Your original is never modified.
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 bg-coral-50 border border-coral-200 text-coral-700 rounded-full px-3 py-1 text-xs font-semibold">
              <Wand2 className="h-3 w-3" />
              AI Retouch Credit
            </div>
          </div>
          <button
            onClick={handlePurchase}
            disabled={loading || purchasing || !previewUrl}
            className="bg-coral-500 hover:bg-coral-600 disabled:bg-cream-300 disabled:text-navy-400 text-white font-semibold px-6 py-2.5 rounded-full transition inline-flex items-center gap-2 shrink-0"
          >
            {purchasing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {purchasing ? "Redirecting..." : `Enhance for \u20AC${price}`}
          </button>
        </footer>
      </div>
    </div>
  );
}
