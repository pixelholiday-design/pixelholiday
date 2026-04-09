/**
 * Reads the local kiosk settings written by /kiosk/setup. Designed to run in
 * the browser only — server components don't know which kiosk they're on.
 */

export type KioskMode = "ONLINE" | "LOCAL";
export type ConnectionType = "LAN" | "WIFI" | "BOTH";
export type NetworkPriority = "LAN" | "WIFI";

export type NetworkConfig = {
  connectionType: ConnectionType;
  lanIp: string;
  wifiSsid: string;
  wifiPassword: string;
  priority: NetworkPriority;
};

export type KioskSettings = {
  name: string;
  type: "SALE_POINT" | "GALLERY_DISPLAY" | "TV_DISPLAY" | "SD_UPLOAD";
  locationId: string;
  networkMode: KioskMode;
  serverIp: string;
  network?: NetworkConfig;
  autoCache?: boolean;
};

export type ConnectivityStatus = {
  lan: "connected" | "offline" | "checking";
  wifi: "connected" | "offline" | "checking";
  active: "lan" | "wifi" | "cloud" | "none";
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
 * Returns the network configuration stored by /kiosk/setup.
 */
export function getNetworkConfig(): NetworkConfig | null {
  const s = loadKioskSettings();
  return s?.network ?? null;
}

/**
 * Determines the best server URL to use, honouring priority (LAN first or WiFi
 * first) and falling back gracefully.
 *
 * Resolution order when priority = "LAN":
 *   1. LAN IP   (if connectionType includes LAN)
 *   2. WiFi IP  (if connectionType includes WiFi) — same serverIp in practice
 *   3. ""       (cloud / same origin)
 *
 * For SALE_POINT kiosks the answer is always "" (they ARE the server).
 */
export function getServerUrl(s: KioskSettings | null): string {
  if (!s) return "";
  if (s.type === "SALE_POINT") return "";
  if (s.networkMode !== "LOCAL") return "";

  const net = s.network;

  // Legacy settings without a network block — fall back to serverIp
  if (!net) {
    if (!s.serverIp) return "";
    return `http://${s.serverIp.replace(/^https?:\/\//, "").replace(/\/$/, "")}:3000`;
  }

  const primary = net.priority === "LAN" ? net.lanIp : null;
  const fallback = net.lanIp || s.serverIp;

  const ip = primary || fallback;
  if (!ip) return "";
  return `http://${ip.replace(/^https?:\/\//, "").replace(/\/$/, "")}:3000`;
}

/**
 * Pings both LAN and WiFi endpoints and returns a ConnectivityStatus.
 * The `serverIp` / `lanIp` stored in settings is used for both checks
 * (in a typical deployment LAN and WiFi share the same sale-point IP;
 * the distinction matters for the connection-type selector, not the IP).
 */
export async function checkConnectivity(
  s: KioskSettings | null
): Promise<ConnectivityStatus> {
  if (!s || s.networkMode !== "LOCAL" || s.type === "SALE_POINT") {
    return { lan: "offline", wifi: "offline", active: "cloud" };
  }

  const net = s.network;
  const lanIp = net?.lanIp || s.serverIp || "";
  const wifiIp = s.serverIp || lanIp; // same IP in most setups

  async function ping(ip: string): Promise<boolean> {
    if (!ip) return false;
    try {
      const r = await fetch(
        `http://${ip.replace(/^https?:\/\//, "").replace(/\/$/, "")}:3000/api/local/status`,
        { cache: "no-store", signal: AbortSignal.timeout(3000) }
      );
      return r.ok;
    } catch {
      return false;
    }
  }

  const connectionType = net?.connectionType ?? "WIFI";
  const priority = net?.priority ?? "LAN";

  const [lanOk, wifiOk] = await Promise.all([
    connectionType !== "WIFI" ? ping(lanIp) : Promise.resolve(false),
    connectionType !== "LAN" ? ping(wifiIp) : Promise.resolve(false),
  ]);

  let active: ConnectivityStatus["active"] = "none";
  if (priority === "LAN") {
    if (lanOk) active = "lan";
    else if (wifiOk) active = "wifi";
  } else {
    if (wifiOk) active = "wifi";
    else if (lanOk) active = "lan";
  }

  return {
    lan: connectionType === "WIFI" ? "offline" : lanOk ? "connected" : "offline",
    wifi: connectionType === "LAN" ? "offline" : wifiOk ? "connected" : "offline",
    active,
  };
}

/**
 * Returns the base URL the kiosk should call for /api/local/* requests.
 * Kept for backwards compatibility — new code should prefer getServerUrl().
 */
export function localApiBase(s: KioskSettings | null): string {
  return getServerUrl(s);
}
