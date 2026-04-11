"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Edit3, ShoppingCart } from "lucide-react";
import type { BookPage, GalleryPhoto } from "./types";

interface Props {
  pages: BookPage[];
  photos: GalleryPhoto[];
  onClose: () => void;
  magicLinkToken: string;
}

export default function PreviewOverlay({ pages, onClose, magicLinkToken }: Props) {
  // Show pages in spread pairs (2 per view)
  const [spreadIdx, setSpreadIdx] = useState(0);

  // First "spread" is the cover alone, then pairs
  const spreads: BookPage[][] = [];
  if (pages.length > 0) spreads.push([pages[0]]); // cover
  for (let i = 1; i < pages.length; i += 2) {
    const pair: BookPage[] = [pages[i]];
    if (pages[i + 1]) pair.push(pages[i + 1]);
    spreads.push(pair);
  }

  const currentSpread = spreads[spreadIdx] || [];

  function renderPage(page: BookPage) {
    const bg = page.background || "#FFFFFF";
    const bgStyle: React.CSSProperties = bg.startsWith("url(")
      ? { backgroundImage: bg, backgroundSize: "cover", backgroundPosition: "center" }
      : bg.startsWith("linear")
        ? { background: bg }
        : { backgroundColor: bg };

    return (
      <div
        className="relative shadow-lg"
        style={{ width: 400, height: 267, ...bgStyle }}
      >
        {page.elements.map((el) => {
          const clipPath = (el.style?.clipPath as string) || "";
          const isPolaroid = clipPath === "polaroid";
          const isRounded = clipPath === "rounded";

          return (
            <div
              key={el.id}
              className="absolute overflow-hidden"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: `${el.height}%`,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
              }}
            >
              {el.type === "photo" && el.content && (
                <div
                  className="w-full h-full"
                  style={{
                    clipPath: clipPath && !isPolaroid && !isRounded ? clipPath : undefined,
                    borderRadius: isRounded ? "20px" : isPolaroid ? "2px" : undefined,
                    border: isPolaroid ? "4px solid white" : undefined,
                    borderBottom: isPolaroid ? "16px solid white" : undefined,
                    boxShadow: isPolaroid ? "0 2px 8px rgba(0,0,0,0.15)" : undefined,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={el.content} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              {el.type === "text" && (
                <div
                  className="w-full h-full flex items-center p-1"
                  style={{
                    fontFamily: (el.style.fontFamily as string) || "DM Sans",
                    fontSize: `${Math.max(8, ((el.style.fontSize as number) || 16) * 0.67)}px`,
                    color: (el.style.color as string) || "#0C2E3D",
                    fontWeight: el.style.bold ? 700 : 400,
                    fontStyle: el.style.italic ? "italic" : "normal",
                    textDecoration: el.style.underline ? "underline" : "none",
                    textAlign: (el.style.align as CanvasTextAlign) || "center",
                    justifyContent: el.style.align === "left" ? "flex-start" : el.style.align === "right" ? "flex-end" : "center",
                  }}
                >
                  <span className="whitespace-pre-wrap break-words w-full">{el.content}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/80">
        <button onClick={onClose} className="flex items-center gap-2 text-white/80 hover:text-white">
          <Edit3 size={16} /> Back to Editor
        </button>
        <span className="text-white/60 text-sm">
          Spread {spreadIdx + 1} of {spreads.length}
        </span>
        <a
          href={`/gallery/${magicLinkToken}/shop`}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium"
        >
          <ShoppingCart size={16} /> Order Book
        </a>
      </div>

      {/* Spread display */}
      <div className="flex-1 flex items-center justify-center gap-1 px-16">
        <button
          onClick={() => setSpreadIdx((i) => Math.max(0, i - 1))}
          disabled={spreadIdx === 0}
          className="p-3 text-white/60 hover:text-white disabled:opacity-20"
        >
          <ChevronLeft size={32} />
        </button>

        <div className="flex gap-1 items-center">
          {currentSpread.map((page, idx) => (
            <div key={idx}>
              {renderPage(page)}
            </div>
          ))}
        </div>

        <button
          onClick={() => setSpreadIdx((i) => Math.min(spreads.length - 1, i + 1))}
          disabled={spreadIdx >= spreads.length - 1}
          className="p-3 text-white/60 hover:text-white disabled:opacity-20"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Page indicator dots */}
      <div className="flex justify-center gap-2 pb-4">
        {spreads.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSpreadIdx(idx)}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === spreadIdx ? "bg-brand-500" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
