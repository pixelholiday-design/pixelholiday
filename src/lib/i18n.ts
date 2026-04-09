/**
 * Lightweight i18n for Fotiqo — no next-intl route restructuring needed.
 *
 * Locale detection: ?lang= param > fotiqo_locale cookie > Accept-Language > "en"
 * Translation: JSON files in messages/<locale>.json
 * Usage: const t = useTranslations("gallery"); t("title") → "Your Photos"
 */

// ── Supported locales ───────────────────────────────────────────────────────

export const LOCALES = [
  "en", "fr", "de", "es", "it", "ar", "tr", "ru", "nl", "pt",
] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Fran\u00e7ais",
  de: "Deutsch",
  es: "Espa\u00f1ol",
  it: "Italiano",
  ar: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
  tr: "T\u00fcrk\u00e7e",
  ru: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",
  nl: "Nederlands",
  pt: "Portugu\u00eas",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "\ud83c\uddec\ud83c\udde7",
  fr: "\ud83c\uddeb\ud83c\uddf7",
  de: "\ud83c\udde9\ud83c\uddea",
  es: "\ud83c\uddea\ud83c\uddf8",
  it: "\ud83c\uddee\ud83c\uddf9",
  ar: "\ud83c\uddf8\ud83c\udde6",
  tr: "\ud83c\uddf9\ud83c\uddf7",
  ru: "\ud83c\uddf7\ud83c\uddfa",
  nl: "\ud83c\uddf3\ud83c\uddf1",
  pt: "\ud83c\uddf5\ud83c\uddf9",
};

export const RTL_LOCALES: Locale[] = ["ar"];

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function isValidLocale(v: string): v is Locale {
  return LOCALES.includes(v as Locale);
}

// ── Cookie name ─────────────────────────────────────────────────────────────

export const LOCALE_COOKIE = "fotiqo_locale";

// ── Locale detection (server-side) ──────────────────────────────────────────

/**
 * Detect locale from multiple sources (priority order):
 * 1. ?lang= query parameter
 * 2. fotiqo_locale cookie
 * 3. Accept-Language header
 * 4. Fallback to "en"
 */
export function detectLocale(opts: {
  searchParams?: { lang?: string };
  cookie?: string;
  acceptLanguage?: string;
}): Locale {
  // 1. URL param
  if (opts.searchParams?.lang && isValidLocale(opts.searchParams.lang)) {
    return opts.searchParams.lang;
  }

  // 2. Cookie
  if (opts.cookie && isValidLocale(opts.cookie)) {
    return opts.cookie;
  }

  // 3. Accept-Language header parsing
  if (opts.acceptLanguage) {
    const langs = opts.acceptLanguage
      .split(",")
      .map((part) => {
        const [lang, q] = part.trim().split(";q=");
        return { lang: lang.trim().split("-")[0].toLowerCase(), q: q ? parseFloat(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { lang } of langs) {
      if (isValidLocale(lang)) return lang;
    }
  }

  return "en";
}

// ── Translation loading ─────────────────────────────────────────────────────

type Messages = Record<string, Record<string, string>>;

const messageCache = new Map<Locale, Messages>();

/**
 * Load messages for a locale. Uses static imports so they're bundled.
 * Returns the full message object: { common: {...}, gallery: {...}, ... }
 */
export async function loadMessages(locale: Locale): Promise<Messages> {
  if (messageCache.has(locale)) return messageCache.get(locale)!;

  let messages: Messages;
  try {
    // Dynamic import from messages/ directory
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    // Fallback to English
    messages = (await import("../../messages/en.json")).default;
  }

  messageCache.set(locale, messages);
  return messages;
}

/**
 * Synchronous message getter for server components.
 * Call loadMessages() first, then use this to get translations.
 */
export function getTranslation(
  messages: Messages,
  namespace: string,
  key: string,
  params?: Record<string, string | number>,
): string {
  const ns = messages[namespace];
  if (!ns) return key;
  let text = ns[key] ?? key;

  // Handle {param} interpolation
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }

  return text;
}

/**
 * Create a translator function for a specific namespace.
 * const t = createTranslator(messages, "gallery");
 * t("title") → "Your Photos"
 * t("capturedBy", { photographer: "Ahmed" }) → "Captured by Ahmed"
 */
export function createTranslator(messages: Messages, namespace: string) {
  return (key: string, params?: Record<string, string | number>): string => {
    return getTranslation(messages, namespace, key, params);
  };
}
