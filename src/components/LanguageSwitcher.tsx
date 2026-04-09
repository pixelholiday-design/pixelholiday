"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n-client";
import { LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from "@/lib/i18n";

/**
 * Compact language switcher dropdown. Shows current locale flag + name,
 * opens a dropdown with all 10 languages. Switches instantly (no page reload).
 */
export default function LanguageSwitcher({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (variant === "full") {
    // Full grid — for kiosk language selection screen
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {LOCALES.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all text-left ${
              locale === loc
                ? "border-brand-400 bg-brand-50 shadow-card"
                : "border-cream-300 bg-white hover:border-brand-300 hover:shadow-sm"
            }`}
          >
            <span className="text-2xl">{LOCALE_FLAGS[loc]}</span>
            <div>
              <div className="font-semibold text-navy-900 text-sm">{LOCALE_NAMES[loc]}</div>
              {locale === loc && (
                <div className="text-[10px] text-brand-500 font-medium mt-0.5 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Selected
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Compact dropdown
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold bg-white border border-cream-300 text-navy-600 hover:bg-cream-100 transition"
        aria-label={t("common.language")}
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{LOCALE_FLAGS[locale]}</span>
        <span className="hidden sm:inline">{LOCALE_NAMES[locale]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-2xl shadow-lift border border-cream-200 py-2 min-w-[200px] animate-fade-in">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-navy-400 uppercase tracking-wider">
            {t("common.chooseLanguage")}
          </div>
          {LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => { setLocale(loc); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition hover:bg-cream-100 ${
                locale === loc ? "text-brand-500 font-semibold" : "text-navy-700"
              }`}
            >
              <span className="text-lg">{LOCALE_FLAGS[loc]}</span>
              <span className="flex-1 text-left">{LOCALE_NAMES[loc]}</span>
              {locale === loc && <Check className="h-4 w-4 text-brand-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
