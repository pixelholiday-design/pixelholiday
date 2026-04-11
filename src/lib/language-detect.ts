/**
 * Auto-detect customer language from phone number, email domain, or browser.
 * Priority: phone > email > browser > "en"
 */

const SUPPORTED = ["en", "fr", "de", "es", "it", "ar", "tr", "ru", "nl", "pt"] as const;
export type SupportedLocale = (typeof SUPPORTED)[number];

export function detectLanguageFromPhone(phone: string): SupportedLocale {
  const digits = phone.replace(/[^0-9+]/g, "");

  // Arabic-speaking
  if (/^\+?(216|212|213|218|20)\d/.test(digits)) return "ar"; // Tunisia, Morocco, Algeria, Libya, Egypt
  if (/^\+?(966|971|965|974|973|968|962|961|964|967)\d/.test(digits)) return "ar"; // Gulf + Levant

  // French
  if (/^\+?(33|32|352)\d/.test(digits)) return "fr"; // France, Belgium, Luxembourg

  // German
  if (/^\+?(49|43)\d/.test(digits)) return "de"; // Germany, Austria

  // Swiss numbers: could be fr/de/it — default de
  if (/^\+?41\d/.test(digits)) return "de";

  // Italian
  if (/^\+?39\d/.test(digits)) return "it";

  // Spanish
  if (/^\+?34\d/.test(digits)) return "es";

  // Turkish
  if (/^\+?90\d/.test(digits)) return "tr";

  // Russian-speaking
  if (/^\+?(7|375|380)\d/.test(digits)) return "ru"; // Russia, Belarus, Ukraine

  // Dutch
  if (/^\+?31\d/.test(digits)) return "nl";

  // Portuguese
  if (/^\+?(351|55)\d/.test(digits)) return "pt"; // Portugal, Brazil

  return "en";
}

export function detectLanguageFromEmail(email: string): SupportedLocale {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  const tld = domain.split(".").pop() || "";

  const tldMap: Record<string, SupportedLocale> = {
    fr: "fr", de: "de", it: "it", es: "es",
    tr: "tr", ru: "ru", nl: "nl", pt: "pt",
    tn: "fr", ma: "fr", dz: "fr",       // North Africa → French
    sa: "ar", ae: "ar", kw: "ar", qa: "ar",
    eg: "ar", jo: "ar", lb: "ar",
    at: "de", // Austria
    be: "fr", // Belgium
    ch: "de", // Switzerland
    br: "pt", // Brazil
  };

  return tldMap[tld] || "en";
}

export function detectLanguageFromBrowser(acceptLanguage: string): SupportedLocale {
  const primary = acceptLanguage?.split(",")[0]?.split("-")[0]?.toLowerCase();
  return (SUPPORTED as readonly string[]).includes(primary || "")
    ? (primary as SupportedLocale)
    : "en";
}

/**
 * Main detection — tries phone first (most reliable), then email, then browser.
 */
export function detectCustomerLanguage(data: {
  phone?: string | null;
  email?: string | null;
  acceptLanguage?: string | null;
}): SupportedLocale {
  if (data.phone) {
    const lang = detectLanguageFromPhone(data.phone);
    if (lang !== "en") return lang;
  }
  if (data.email) {
    const lang = detectLanguageFromEmail(data.email);
    if (lang !== "en") return lang;
  }
  if (data.acceptLanguage) {
    return detectLanguageFromBrowser(data.acceptLanguage);
  }
  return "en";
}
