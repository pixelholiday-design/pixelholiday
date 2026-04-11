"use client";
import { useState } from "react";
import { X, Type, Palette, Image as ImageIcon } from "lucide-react";
import { getPhotoSrc } from "@/lib/cloudinary";

type Photo = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
  isPurchased?: boolean;
  _signedWm?: string;
  _signedClean?: string;
};

type Template = {
  name: string;
  layout: string;
  colors: { bg: string; text: string; accent: string };
};

const TEMPLATES: Template[] = [
  { name: "Classic White", layout: "photo-top", colors: { bg: "#ffffff", text: "#333333", accent: "#0EA5A5" } },
  { name: "Elegant Dark", layout: "photo-top", colors: { bg: "#1a1a2e", text: "#ffffff", accent: "#e0c68b" } },
  { name: "Warm Sunset", layout: "photo-top", colors: { bg: "#fff5eb", text: "#5c3a1e", accent: "#e07830" } },
  { name: "Ocean Blue", layout: "photo-top", colors: { bg: "#eef6fc", text: "#1a3a5c", accent: "#2980b9" } },
  { name: "Forest Green", layout: "photo-top", colors: { bg: "#f0f5f0", text: "#2d4a2d", accent: "#27ae60" } },
  { name: "Rose Gold", layout: "photo-left", colors: { bg: "#fdf0f0", text: "#5c2a2a", accent: "#c07878" } },
  { name: "Modern Minimal", layout: "photo-center", colors: { bg: "#fafafa", text: "#222222", accent: "#999999" } },
  { name: "Holiday Red", layout: "photo-top", colors: { bg: "#f9f0f0", text: "#8b1a1a", accent: "#c41e3a" } },
  { name: "Spring Bloom", layout: "photo-top", colors: { bg: "#fdf5f9", text: "#5c2a4a", accent: "#e91e8c" } },
  { name: "Vintage Cream", layout: "photo-center", colors: { bg: "#f5f0e0", text: "#4a3a2a", accent: "#8b7355" } },
];

const FONTS = [
  { name: "Classic Serif", family: "Georgia, serif" },
  { name: "Modern Sans", family: "system-ui, sans-serif" },
  { name: "Elegant Script", family: "cursive" },
  { name: "Bold Display", family: "Impact, sans-serif" },
  { name: "Clean", family: "'Segoe UI', sans-serif" },
];

export default function CardDesigner({
  photos,
  isPaid,
  cardType,
  onClose,
  onAddToCart,
}: {
  photos: Photo[];
  isPaid: boolean;
  cardType: string;
  onClose: () => void;
  onAddToCart: (config: { templateName: string; headline: string; message: string; photoId: string; font: string; colors: any }) => void;
}) {
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [headline, setHeadline] = useState(
    cardType === "holiday" ? "Happy Holidays" :
    cardType === "thank-you" ? "Thank You" :
    cardType === "save-the-date" ? "Save the Date" :
    "Thinking of You"
  );
  const [message, setMessage] = useState(
    cardType === "holiday" ? "Wishing you joy and peace this season" :
    cardType === "thank-you" ? "Thank you for everything" :
    cardType === "save-the-date" ? "We're getting married!" :
    "Sending warm wishes"
  );
  const [fontIdx, setFontIdx] = useState(0);
  const font = FONTS[fontIdx];
  const photo = photos[selectedPhotoIdx];
  const photoSrc = photo ? getPhotoSrc(photo, !!(isPaid || photo.isPurchased)) : "";

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cream-300">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-brand-500" />
          <h2 className="font-display text-xl text-navy-900">Card Designer</h2>
          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold capitalize">{cardType}</span>
        </div>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-100">
          <X className="h-5 w-5 text-navy-600" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Live preview */}
        <div className="flex-1 flex items-center justify-center bg-cream-50 p-8">
          <div
            className="relative shadow-lift rounded-lg overflow-hidden"
            style={{
              width: 350,
              height: 490,
              backgroundColor: template.colors.bg,
              fontFamily: font.family,
            }}
          >
            {/* Photo area */}
            <div className="w-full h-[58%] overflow-hidden">
              {photoSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoSrc} alt="" className="w-full h-full object-cover" />
              )}
            </div>

            {/* Text area */}
            <div className="px-6 py-5 text-center" style={{ color: template.colors.text }}>
              <h3
                className="text-2xl font-bold leading-tight mb-2"
                style={{ color: template.colors.accent }}
              >
                {headline}
              </h3>
              <p className="text-sm opacity-80 leading-relaxed">{message}</p>
            </div>

            {/* Accent line */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: "32%",
                width: "30%",
                height: 2,
                backgroundColor: template.colors.accent,
                opacity: 0.3,
              }}
            />
          </div>
        </div>

        {/* Right: Options */}
        <div className="w-80 border-l border-cream-300 overflow-y-auto p-5 space-y-6">
          {/* Photo selector */}
          <div>
            <label className="text-xs font-semibold text-navy-600 uppercase tracking-wider mb-2 block">
              Photo
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {photos.slice(0, 12).map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPhotoIdx(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                    i === selectedPhotoIdx ? "border-brand-500" : "border-transparent opacity-60"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getPhotoSrc(p, !!(isPaid || p.isPurchased))} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Template selector */}
          <div>
            <label className="text-xs font-semibold text-navy-600 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Palette className="h-3 w-3" /> Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTemplate(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${
                    template.name === t.name
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-cream-300 text-navy-600 hover:border-navy-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                    {t.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="text-xs font-semibold text-navy-600 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Type className="h-3 w-3" /> Headline
            </label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-semibold text-navy-600 uppercase tracking-wider mb-2 block">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
            />
          </div>

          {/* Font */}
          <div>
            <label className="text-xs font-semibold text-navy-600 uppercase tracking-wider mb-2 block">
              Font
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FONTS.map((f, i) => (
                <button
                  key={f.name}
                  onClick={() => setFontIdx(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                    fontIdx === i ? "border-brand-500 bg-brand-50 text-brand-700" : "border-cream-300 text-navy-600"
                  }`}
                  style={{ fontFamily: f.family }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={() => {
              onAddToCart({
                templateName: template.name,
                headline,
                message,
                photoId: photo?.id || "",
                font: font.name,
                colors: template.colors,
              });
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm transition"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
