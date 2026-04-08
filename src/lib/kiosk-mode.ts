/**
 * Reads the local kiosk settings written by /kiosk/setup. Designed to run in
 * the browser only — server components don't know which kiosk they're on.
 */

export type KioskMode = "ONLINE" | "LOCAL";
export type KioskSettings = {
  name: string;
  type: "SALE_POINT" | "GALLERY_DISPLAY" | "TV_DISPLAY" | "SD_UPLOAD";
  locationId: string;
  networkMode: KioskMode;
  serverIp: string;
};

const KEY = "ph-kiosk-settings";

export function loadKioskSettings(): KioskSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as KioskSettings) : null;
  } catch {
    return null;
  }
}

/**
 * Returns the base URL the kiosk should call for /api/local/* requests.
 *   - LOCAL + GALLERY_DISPLAY → http://<serverIp>:3000
 *   - LOCAL + SALE_POINT      → "" (same origin — we ARE the server)
 *   - ONLINE                  → "" (same origin — cloud server)
 */
export function localApiBase(s: KioskSettings | null): string {
  if (!s || s.networkMode !== "LOCAL") return "";
  if (s.type === "SALE_POINT") return "";
  if (!s.serverIp) return "";
  return `http://${s.serverIp.replace(/^https?:\/\//, "").replace(/\/$/, "")}:3000`;
}
