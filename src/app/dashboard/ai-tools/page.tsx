"use client";

import { useState } from "react";
import { Wand2, Sparkles, Eraser, ArrowUpCircle, Sun, Palette, ImageIcon } from "lucide-react";

const AI_ACTIONS = [
  { id: "auto_enhance", label: "Auto Enhance", desc: "Color, brightness & contrast correction", icon: Sparkles },
  { id: "upscale", label: "AI Upscale", desc: "Increase resolution up to 4x", icon: ArrowUpCircle },
  { id: "remove_bg", label: "Remove Background", desc: "AI background removal", icon: Eraser },
  { id: "gen_remove", label: "Blemish Removal", desc: "AI-powered blemish and object removal", icon: Wand2 },
  { id: "restore", label: "Photo Restore", desc: "Restore old or damaged photos", icon: ImageIcon },
  { id: "sharpen", label: "Smart Sharpen", desc: "AI sharpening for crisp details", icon: Sun },
  { id: "vibrance", label: "Vibrance Boost", desc: "Enhanced colors with auto brightness", icon: Palette },
];

export default function AIToolsPage() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [galleryToken, setGalleryToken] = useState("");
  const [photoId, setPhotoId] = useState("");
  const [result, setResult] = useState<{ original: string; result: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleProcess() {
    if (!galleryToken || !photoId || !selectedAction) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/gallery/${galleryToken}/retouch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, preset: "auto", action: selectedAction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed");
      setResult({ original: data.originalUrl || data.original, result: data.previewUrl || data.result });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Wand2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">AI Retouching Tools</h1>
          <p className="text-navy-500 text-sm">Cloudinary-powered AI photo enhancements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {AI_ACTIONS.map((action) => {
          const Icon = action.icon;
          const isSelected = selectedAction === action.id;
          return (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-brand-500 bg-brand-50 shadow-md"
                  : "border-cream-200 bg-white hover:border-brand-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`h-5 w-5 ${isSelected ? "text-brand-600" : "text-navy-400"}`} />
                <span className={`font-semibold ${isSelected ? "text-brand-700" : "text-navy-800"}`}>
                  {action.label}
                </span>
              </div>
              <p className="text-xs text-navy-500">{action.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-cream-200 p-6 mb-6">
        <h2 className="font-semibold text-navy-800 mb-4">Process Photo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-navy-600 mb-1">Gallery Token</label>
            <input
              type="text"
              value={galleryToken}
              onChange={(e) => setGalleryToken(e.target.value)}
              placeholder="Enter gallery magic link token"
              className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm text-navy-600 mb-1">Photo ID</label>
            <input
              type="text"
              value={photoId}
              onChange={(e) => setPhotoId(e.target.value)}
              placeholder="Enter photo ID"
              className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>
        <button
          onClick={handleProcess}
          disabled={!selectedAction || !galleryToken || !photoId || loading}
          className="px-5 py-2.5 bg-brand-500 text-white rounded-lg font-medium text-sm hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : `Apply ${AI_ACTIONS.find((a) => a.id === selectedAction)?.label || "Enhancement"}`}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-cream-200 p-6">
          <h2 className="font-semibold text-navy-800 mb-4">Before / After</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-navy-500 mb-2">Original</p>
              <img src={result.original} alt="Original" className="w-full rounded-lg" />
            </div>
            <div>
              <p className="text-xs text-navy-500 mb-2">Enhanced</p>
              <img src={result.result} alt="Enhanced" className="w-full rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
