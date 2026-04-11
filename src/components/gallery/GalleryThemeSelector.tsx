"use client";

import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { getThemeList, type GalleryTheme } from "@/lib/gallery-themes";

interface Props {
  currentTheme: string;
  onSelect: (themeId: string) => void;
}

export default function GalleryThemeSelector({ currentTheme, onSelect }: Props) {
  const themes = getThemeList();

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Palette className="h-4 w-4 text-navy-500" />
        <h3 className="font-semibold text-navy-800 text-sm">Gallery Theme</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {themes.map((theme) => {
          const isSelected = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onSelect(theme.id)}
              className={`relative text-left p-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-brand-500 bg-brand-50 shadow-md"
                  : "border-cream-200 bg-white hover:border-brand-300"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              {/* Theme preview */}
              <div className={`h-16 rounded-lg mb-2 ${theme.bgClass} border border-cream-200 p-2`}>
                <div className={`h-full ${theme.id === "filmstrip" ? "flex gap-1 overflow-hidden" : `grid ${theme.gridCols.split(" ")[0]} gap-1`}`}>
                  {Array.from({ length: Math.min(4, theme.id === "minimal" ? 2 : 4) }).map((_, i) => (
                    <div
                      key={i}
                      className={`${theme.photoClass} bg-cream-300 ${theme.id === "filmstrip" ? "shrink-0 w-8" : ""}`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm font-medium text-navy-800">{theme.name}</div>
              <div className="text-[11px] text-navy-400">{theme.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
