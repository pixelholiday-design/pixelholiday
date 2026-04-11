"use client";

import { Plus, Star } from "lucide-react";
import type { BookPage, GalleryPhoto } from "./types";

interface Props {
  pages: BookPage[];
  currentPage: number;
  onSelectPage: (idx: number) => void;
  onAddPage: () => void;
  photos: GalleryPhoto[];
}

export default function PageThumbnails({ pages, currentPage, onSelectPage, onAddPage }: Props) {
  return (
    <div className="w-28 bg-gray-50 border-r flex flex-col shrink-0">
      <div className="p-2 border-b">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Pages</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {pages.map((page, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPage(idx)}
            className={`relative w-full rounded transition-all ${
              currentPage === idx
                ? "ring-2 ring-brand-500 shadow-md"
                : "ring-1 ring-gray-200 hover:ring-gray-400"
            }`}
          >
            {/* Mini page preview */}
            <div
              className="w-full aspect-[3/2] rounded overflow-hidden relative"
              style={{
                background: page.background?.startsWith("url(")
                  ? `${page.background} center/cover`
                  : page.background?.startsWith("linear")
                    ? page.background
                    : page.background || "#fff",
              }}
            >
              {page.elements.map((el) => (
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
                  {el.type === "photo" && el.content ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={el.content} alt="" className="w-full h-full object-cover" />
                  ) : el.type === "text" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[4px] text-gray-400 truncate">{el.content}</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
            {/* Page label */}
            <div className="flex items-center justify-center gap-0.5 py-0.5">
              {idx === 0 && <Star size={8} className="text-brand-500 fill-brand-500" />}
              <span className="text-[9px] text-gray-500">
                {idx === 0 ? "Cover" : `Page ${idx}`}
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="p-2 border-t">
        <button
          onClick={onAddPage}
          className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-brand-500 border border-dashed border-brand-300 rounded hover:bg-brand-50 transition-colors"
        >
          <Plus size={12} /> Add Page
        </button>
      </div>
    </div>
  );
}
