"use client";
import { useState, useMemo } from "react";
import { Music, Clock, Play, ShoppingCart, Check, ChevronRight, ChevronLeft, X, Image } from "lucide-react";
import { MUSIC_TRACKS, MUSIC_CATEGORIES, type MusicTrack } from "@/lib/slideshow";

type Photo = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
};

type Props = {
  token: string;
  photos: Photo[];
  photoUrlFn: (p: Photo) => string;
  onClose: () => void;
};

const DURATIONS: { value: 30 | 60 | 90; label: string; priceLabel: string }[] = [
  { value: 30, label: "30 seconds", priceLabel: "\u20AC20" },
  { value: 60, label: "60 seconds", priceLabel: "\u20AC30" },
  { value: 90, label: "90 seconds", priceLabel: "\u20AC40" },
];

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  romantic: { label: "Romantic", emoji: "\u2764\uFE0F" },
  upbeat: { label: "Upbeat", emoji: "\u26A1" },
  adventure: { label: "Adventure", emoji: "\uD83C\uDF0D" },
  chill: { label: "Chill", emoji: "\uD83C\uDF34" },
  celebration: { label: "Celebration", emoji: "\uD83C\uDF89" },
};

const STEPS = ["Select Photos", "Choose Music", "Duration", "Preview", "Purchase"];

export default function SlideshowBuilder({ token, photos, photoUrlFn, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<string>("romantic");
  const [trackId, setTrackId] = useState<string>("");
  const [duration, setDuration] = useState<30 | 60 | 90>(30);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reelId, setReelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryTracks = useMemo(
    () => MUSIC_TRACKS.filter((t) => t.category === category),
    [category],
  );

  // Auto-select first track in category when category changes
  function handleCategoryChange(cat: string) {
    setCategory(cat);
    const first = MUSIC_TRACKS.find((t) => t.category === cat);
    if (first) setTrackId(first.id);
  }

  function togglePhoto(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 30) {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    const ids = photos.slice(0, 30).map((p) => p.id);
    setSelectedIds(new Set(ids));
  }

  function clearAll() {
    setSelectedIds(new Set());
  }

  const canNext = (): boolean => {
    if (step === 0) return selectedIds.size >= 5;
    if (step === 1) return !!trackId;
    if (step === 2) return true;
    if (step === 3) return !!previewUrl;
    return true;
  };

  async function generatePreview() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/gallery/${token}/slideshow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoIds: Array.from(selectedIds),
          musicTrackId: trackId,
          duration,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to generate slideshow");
      setReelId(data.reelId);
      setPreviewUrl(data.previewUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase() {
    if (!reelId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/gallery/${token}/slideshow/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reelId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Payment setup failed");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handleNext() {
    if (step === 2) {
      // Moving to preview step — generate it
      setStep(3);
      generatePreview();
      return;
    }
    if (step === 4) {
      handlePurchase();
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const priceForDuration = DURATIONS.find((d) => d.value === duration)?.priceLabel ?? "\u20AC20";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
          <h2 className="text-lg font-bold text-navy-900">Create Your Slideshow</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-cream-100 text-navy-400">
            <X size={20} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 py-3 bg-cream-50">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i < step
                    ? "bg-coral-500 text-white"
                    : i === step
                      ? "bg-brand-600 text-white"
                      : "bg-cream-200 text-navy-400"
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-0.5 ${i < step ? "bg-coral-400" : "bg-cream-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 0: Select Photos */}
          {step === 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-navy-800 flex items-center gap-2">
                    <Image size={18} /> Select Photos
                  </h3>
                  <p className="text-sm text-navy-500 mt-1">
                    Choose 5-30 photos for your slideshow ({selectedIds.size} selected)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs px-3 py-1 rounded-full bg-cream-100 text-navy-600 hover:bg-cream-200">
                    Select all
                  </button>
                  <button onClick={clearAll} className="text-xs px-3 py-1 rounded-full bg-cream-100 text-navy-600 hover:bg-cream-200">
                    Clear
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-80 overflow-y-auto">
                {photos.map((p) => {
                  const sel = selectedIds.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePhoto(p.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        sel ? "border-coral-500 ring-2 ring-coral-300" : "border-transparent hover:border-cream-300"
                      }`}
                    >
                      <img
                        src={photoUrlFn(p)}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {sel && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-coral-500 rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Choose Music */}
          {step === 1 && (
            <div>
              <h3 className="font-semibold text-navy-800 flex items-center gap-2 mb-4">
                <Music size={18} /> Choose Music
              </h3>

              {/* Category tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {MUSIC_CATEGORIES.map((cat) => {
                  const info = CATEGORY_LABELS[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        category === cat
                          ? "bg-brand-600 text-white"
                          : "bg-cream-100 text-navy-600 hover:bg-cream-200"
                      }`}
                    >
                      {info.emoji} {info.label}
                    </button>
                  );
                })}
              </div>

              {/* Tracks in category */}
              <div className="space-y-2">
                {categoryTracks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTrackId(t.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      trackId === t.id
                        ? "border-coral-500 bg-coral-50"
                        : "border-cream-200 hover:border-cream-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          trackId === t.id ? "bg-coral-500 text-white" : "bg-cream-100 text-navy-500"
                        }`}
                      >
                        <Music size={16} />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-navy-800">{t.name}</div>
                        <div className="text-xs text-navy-400">{t.bpm} BPM</div>
                      </div>
                    </div>
                    {trackId === t.id && <Check size={18} className="text-coral-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Duration */}
          {step === 2 && (
            <div>
              <h3 className="font-semibold text-navy-800 flex items-center gap-2 mb-4">
                <Clock size={18} /> Choose Duration
              </h3>
              <div className="space-y-3">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      duration === d.value
                        ? "border-coral-500 bg-coral-50"
                        : "border-cream-200 hover:border-cream-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                          duration === d.value
                            ? "bg-coral-500 text-white"
                            : "bg-cream-100 text-navy-500"
                        }`}
                      >
                        {d.value}s
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-navy-800">{d.label}</div>
                        <div className="text-sm text-navy-400">
                          ~{Math.round(d.value / (selectedIds.size || 1))}s per photo
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-coral-600">{d.priceLabel}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <div>
              <h3 className="font-semibold text-navy-800 flex items-center gap-2 mb-4">
                <Play size={18} /> Preview Your Slideshow
              </h3>
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-navy-400">
                  <div className="w-8 h-8 border-2 border-coral-400 border-t-transparent rounded-full animate-spin mb-3" />
                  <p>Generating your slideshow...</p>
                </div>
              )}
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm">{error}</div>
              )}
              {previewUrl && !loading && (
                <div className="rounded-xl overflow-hidden border border-cream-200 bg-black">
                  <iframe
                    src={previewUrl}
                    className="w-full aspect-video"
                    title="Slideshow Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              )}
              {previewUrl && !loading && (
                <p className="text-sm text-navy-400 mt-3 text-center">
                  Click the play button in the preview to watch your slideshow
                </p>
              )}
            </div>
          )}

          {/* Step 4: Purchase */}
          {step === 4 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-coral-100 rounded-full flex items-center justify-center">
                <ShoppingCart size={28} className="text-coral-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">Ready to Purchase</h3>
              <p className="text-navy-500 mb-6">
                Your {duration}-second slideshow with {selectedIds.size} photos is ready.
              </p>
              <div className="inline-block bg-cream-50 rounded-xl p-4 mb-6">
                <div className="text-3xl font-bold text-coral-600">{priceForDuration}</div>
                <div className="text-sm text-navy-400">one-time purchase</div>
              </div>
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-cream-200 bg-cream-50">
          <button
            onClick={step === 0 ? onClose : handleBack}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-navy-600 hover:bg-cream-200 transition-colors"
          >
            <ChevronLeft size={16} />
            {step === 0 ? "Cancel" : "Back"}
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext() || loading}
            className={`flex items-center gap-1 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              canNext() && !loading
                ? "bg-coral-500 text-white hover:bg-coral-600"
                : "bg-cream-200 text-navy-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : step === 4 ? (
              <>
                Buy Slideshow {priceForDuration}
                <ShoppingCart size={16} />
              </>
            ) : (
              <>
                Next
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
