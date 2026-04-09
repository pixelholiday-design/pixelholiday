"use client";

import { createContext, useContext, useCallback, useState, useEffect } from "react";
import type { Locale } from "./i18n";
import { LOCALES, LOCALE_COOKIE, isValidLocale, isRtl } from "./i18n";

// ── Types ───────────────────────────────────────────────────────────────────

type Messages = Record<string, Record<string, string>>;

type I18nContextValue = {
  locale: Locale;
  messages: Messages;
  /** Translate a key: t("gallery.title") or t("capturedBy", { photographer: "Ahmed" }) */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Switch to a different locale (sets cookie + reloads messages) */
  setLocale: (locale: Locale) => void;
  /** Whether the current locale is RTL */
  rtl: boolean;
};

// ── Context ─────────────────────────────────────────────────────────────────

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Provider that wraps customer-facing pages. Receives pre-loaded messages
 * from the server component.
 */
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);
  const [currentMessages, setCurrentMessages] = useState<Messages>(messages);

  // Apply RTL direction
  useEffect(() => {
    document.documentElement.dir = isRtl(currentLocale) ? "rtl" : "ltr";
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // Support "namespace.key" dot notation
      const parts = key.split(".");
      let ns: string;
      let k: string;
      if (parts.length >= 2) {
        ns = parts[0];
        k = parts.slice(1).join(".");
      } else {
        ns = "common";
        k = key;
      }

      const section = currentMessages[ns];
      if (!section) return key;
      let text = section[k] ?? key;

      if (params) {
        for (const [pKey, pVal] of Object.entries(params)) {
          text = text.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
        }
      }

      return text;
    },
    [currentMessages],
  );

  const setLocale = useCallback(async (newLocale: Locale) => {
    if (!isValidLocale(newLocale)) return;

    // Set cookie (expires in 1 year)
    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=${365 * 24 * 3600};samesite=lax`;

    // Load new messages
    try {
      const mod = await import(`../../messages/${newLocale}.json`);
      setCurrentMessages(mod.default);
      setCurrentLocale(newLocale);
    } catch {
      // Fallback: reload page with ?lang= param
      const url = new URL(window.location.href);
      url.searchParams.set("lang", newLocale);
      window.location.href = url.toString();
    }
  }, []);

  const value: I18nContextValue = {
    locale: currentLocale,
    messages: currentMessages,
    t,
    setLocale,
    rtl: isRtl(currentLocale),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ── Hook ────────────────────────────────────────────────────────────────────

/**
 * Access translations in any client component.
 *
 * Usage:
 *   const { t, locale, setLocale, rtl } = useI18n();
 *   <h1>{t("gallery.title")}</h1>
 *   <p>{t("gallery.capturedBy", { photographer: "Ahmed" })}</p>
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback: return a pass-through translator when used outside provider
    // (admin pages, etc. that don't wrap with I18nProvider)
    return {
      locale: "en",
      messages: {},
      t: (key: string) => {
        const parts = key.split(".");
        return parts[parts.length - 1];
      },
      setLocale: () => {},
      rtl: false,
    };
  }
  return ctx;
}

/**
 * Shorthand for getting a namespaced translator.
 *
 * Usage:
 *   const t = useTranslations("gallery");
 *   <h1>{t("title")}</h1>
 */
export function useTranslations(namespace: string) {
  const { t } = useI18n();
  return useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return t(`${namespace}.${key}`, params);
    },
    [namespace, t],
  );
}
