"use client";
import { useState } from "react";

// Module 13: Pro Retouch — gallery → photo → tools, batch + before/after slider.
export default function RetouchPage() {
  const [galleryId, setGalleryId] = useState("");
  const [photoIds, setPhotoIds] = useState<string>("");
  const [preset, setPreset] = useState("auto-color");
  const [sliderPos, setSliderPos] = useState(50);
  const [status, setStatus] = useState("");

  async function apply() {
    setStatus("Applying...");
    const res = await fetch("/api/admin/retouch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        photoIds: photoIds.split(",").map((s) => s.trim()).filter(Boolean),
        preset,
      }),
    });
    const data = await res.json();
    setStatus(`Done — ${data.updated ?? 0} photos retouched`);
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Pro Retouch Studio</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3 p-4 border rounded">
          <h2 className="font-semibold">1. Select gallery & photos</h2>
          <input className="border p-2 w-full" placeholder="Gallery ID"
            value={galleryId} onChange={(e) => setGalleryId(e.target.value)} />
          <textarea className="border p-2 w-full" placeholder="Photo IDs (comma separated for batch)"
            value={photoIds} onChange={(e) => setPhotoIds(e.target.value)} />

          <h2 className="font-semibold mt-4">2. Retouch tools</h2>
          <select className="border p-2 w-full" value={preset} onChange={(e) => setPreset(e.target.value)}>
            <option value="auto-color">Auto Color Correction</option>
            <option value="exposure">Exposure Adjustment</option>
            <option value="white-balance">White Balance</option>
            <option value="skin-smoothing">Skin Smoothing</option>
            <option value="batch-portrait">Batch Portrait Preset</option>
          </select>

          <button onClick={apply} className="bg-black text-white p-2 w-full">
            Apply Retouch
          </button>
          {status && <p className="text-sm text-green-700">{status}</p>}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Before / After comparison</h2>
          <div className="relative h-64 bg-gray-200 overflow-hidden rounded">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-700" />
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-300 to-pink-400"
                 style={{ width: `${sliderPos}%` }} />
            <div className="absolute inset-y-0 w-1 bg-white" style={{ left: `${sliderPos}%` }} />
          </div>
          <input type="range" min="0" max="100" value={sliderPos}
                 onChange={(e) => setSliderPos(Number(e.target.value))} className="w-full mt-2" />
          <p className="text-xs text-gray-500">Drag to reveal before / after</p>
        </div>
      </div>
    </div>
  );
}
