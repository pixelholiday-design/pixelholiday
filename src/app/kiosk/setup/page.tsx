"use client";
import { useEffect, useState } from "react";
import { Save, Loader2, Wifi, Cloud, Settings as Cog, Check, Network, Database, Trash2, RefreshCw } from "lucide-react";
import { getCacheStats, clearAllCache, cacheGalleryPhotos } from "@/lib/kiosk-photo-cache";

type ConnectionType = "LAN" | "WIFI" | "BOTH";
type NetworkPriority = "LAN" | "WIFI";

type NetworkConfig = {
  connectionType: ConnectionType;
  lanIp: string;
  wifiSsid: string;
  wifiPassword: string;
  priority: NetworkPriority;
};

type Settings = {
  name: string;
  type: "SALE_POINT" | "GALLERY_DISPLAY" | "TV_DISPLAY" | "SD_UPLOAD";
  locationId: string;
  locationType: "HOTEL" | "WATER_PARK" | "ATTRACTION" | "SELF_SERVICE";
  networkMode: "ONLINE" | "LOCAL";
  serverIp: string;
  network: NetworkConfig;
  autoCache: boolean;
};

const KEY = "ph-kiosk-settings";

function loadFromStorage(): Settings | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

type TestResult = { lan: "ok" | "err" | null; wifi: "ok" | "err" | null; cloud: "ok" | "err" | null };

export default function KioskSetupPage() {
  const [settings, setSettings] = useState<Settings>({
    name: "",
    type: "GALLERY_DISPLAY",
    locationId: "",
    locationType: "WATER_PARK",
    networkMode: "ONLINE",
    serverIp: "",
    network: {
      connectionType: "BOTH",
      lanIp: "",
      wifiSsid: "",
      wifiPassword: "",
      priority: "LAN",
    },
    autoCache: true,
  });
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [saved, setSaved] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [autoIp, setAutoIp] = useState<string | null>(null);

  // Network test state
  const [testBusy, setTestBusy] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>({ lan: null, wifi: null, cloud: null });

  // Cache stats state
  const [cacheStats, setCacheStats] = useState<{ count: number; sizeBytes: number } | null>(null);
  const [cacheBusy, setCacheBusy] = useState(false);

  useEffect(() => {
    const existing = loadFromStorage();
    if (existing) {
      setSettings((prev) => ({
        ...prev,
        ...existing,
        network: { ...prev.network, ...(existing as any).network },
        autoCache: (existing as any).autoCache !== undefined ? (existing as any).autoCache : true,
      }));
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    getCacheStats().then(setCacheStats).catch(() => {});
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    fetch("/api/admin/staff")
      .then((r) => r.json())
      .then((d) => {
        const locs = Array.from(new Map((d.staff || []).filter((s: any) => s.location).map((s: any) => [s.location.id, s.location])).values()) as any;
        setLocations(locs);
        if (locs[0] && !settings.locationId) setSettings((s) => ({ ...s, locationId: locs[0].id }));
      })
      .catch(() => {});
    // best-effort: report local hostname for SALE_POINT
    if (typeof window !== "undefined") {
      setAutoIp(window.location.hostname);
    }
    // eslint-disable-next-line
  }, [unlocked]);

  function setNet<K extends keyof NetworkConfig>(key: K, value: NetworkConfig[K]) {
    setSettings((s) => ({ ...s, network: { ...s.network, [key]: value } }));
  }

  async function testConnections() {
    setTestBusy(true);
    setTestResult({ lan: null, wifi: null, cloud: null });

    async function ping(url: string) {
      try {
        const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(3000) });
        return r.ok ? "ok" : "err";
      } catch {
        return "err";
      }
    }

    const net = settings.network;
    const lanIp = net.lanIp.trim();
    const serverIp = settings.serverIp.trim() || lanIp;

    const [lan, wifi, cloud] = await Promise.all([
      net.connectionType !== "WIFI" && lanIp
        ? ping(`http://${lanIp}:3000/api/local/status`)
        : Promise.resolve<"ok" | "err" | null>(null),
      net.connectionType !== "LAN" && serverIp
        ? ping(`http://${serverIp}:3000/api/local/status`)
        : Promise.resolve<"ok" | "err" | null>(null),
      ping("/api/local/status"),
    ]);

    setTestResult({ lan: lan as any, wifi: wifi as any, cloud: cloud as any });
    setTestBusy(false);
  }

  async function handleClearCache() {
    setCacheBusy(true);
    await clearAllCache();
    const stats = await getCacheStats();
    setCacheStats(stats);
    setCacheBusy(false);
  }

  async function handlePreCacheAll() {
    setCacheBusy(true);
    // Fetch gallery list from local or cloud API
    const base = settings.networkMode === "LOCAL" && settings.serverIp
      ? `http://${settings.serverIp}:3000`
      : "";
    try {
      const r = await fetch(`${base}/api/kiosk/galleries?locationId=${settings.locationId}`);
      const data = await r.json();
      const galleries: { id: string; photos: { id: string; cloudinaryId: string | null; s3Key_highRes: string }[] }[] = data.galleries ?? [];
      for (const g of galleries) {
        const photos = g.photos.map((p) => ({
          id: p.id,
          url: p.cloudinaryId
            ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"}/image/upload/${p.cloudinaryId}`
            : p.s3Key_highRes,
        }));
        await cacheGalleryPhotos(g.id, photos);
      }
    } catch {
      // Non-fatal
    }
    const stats = await getCacheStats();
    setCacheStats(stats);
    setCacheBusy(false);
  }

  async function unlock() {
    const r = await fetch("/api/kiosk/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    }).then((r) => r.json());
    if (r.ok) setUnlocked(true);
    else alert("Wrong PIN");
  }

  async function save() {
    setBusy(true);
    localStorage.setItem(KEY, JSON.stringify(settings));
    // also register/update the KioskConfig in the cloud DB
    try {
      await fetch("/api/admin/kiosk-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalId: `kiosk-${settings.name.replace(/\s+/g, "-").toLowerCase()}`,
          name: settings.name,
          type: settings.type,
          locationId: settings.locationId,
          networkMode: settings.networkMode,
          serverIp: settings.networkMode === "LOCAL" ? (settings.type === "SALE_POINT" ? autoIp : settings.serverIp) : null,
          isLocalServer: settings.type === "SALE_POINT" && settings.networkMode === "LOCAL",
        }),
      });
      setRegistered(true);
    } catch {}
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!unlocked) {
    return (
      <div className="fixed inset-0 bg-navy-900 flex flex-col items-center justify-center p-8">
        <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-3">Kiosk setup</div>
        <h1 className="font-display text-3xl text-white mb-6">Enter staff PIN to configure</h1>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          className="text-center text-3xl font-mono tracking-widest bg-white/10 text-white rounded-2xl px-6 py-4 mb-4"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
        />
        <button onClick={unlock} className="btn-primary !py-3">
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-coral-500/15 ring-1 ring-coral-500/30 flex items-center justify-center">
            <Cog className="h-6 w-6 text-coral-400" />
          </div>
          <div>
            <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold">Kiosk setup</div>
            <h1 className="font-display text-3xl">Device configuration</h1>
          </div>
        </header>

        <div className="card !bg-white/5 !border-white/10 p-6 space-y-4 text-white">
          <label className="block">
            <div className="label-xs text-white/60 mb-1.5">Kiosk display name</div>
            <input
              className="input !text-navy-900"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              placeholder="Lobby Kiosk 1"
            />
          </label>

          <label className="block">
            <div className="label-xs text-white/60 mb-1.5">Kiosk type</div>
            <select
              className="input !text-navy-900"
              value={settings.type}
              onChange={(e) => setSettings({ ...settings, type: e.target.value as any })}
            >
              <option value="SALE_POINT">Sale point (POS — local server)</option>
              <option value="GALLERY_DISPLAY">Gallery display (customer-facing)</option>
              <option value="TV_DISPLAY">TV display (attract screen)</option>
              <option value="SD_UPLOAD">SD upload station</option>
            </select>
          </label>

          <label className="block">
            <div className="label-xs text-white/60 mb-1.5">Location</div>
            <select
              className="input !text-navy-900"
              value={settings.locationId}
              onChange={(e) => setSettings({ ...settings, locationId: e.target.value })}
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div className="label-xs text-white/60 mb-1.5">Location type</div>
            <select
              className="input !text-navy-900"
              value={settings.locationType}
              onChange={(e) => setSettings({ ...settings, locationType: e.target.value as any })}
            >
              <option value="HOTEL">Hotel</option>
              <option value="WATER_PARK">Water Park</option>
              <option value="ATTRACTION">Attraction</option>
              <option value="SELF_SERVICE">Self-Service</option>
            </select>
          </label>

          <div>
            <div className="label-xs text-white/60 mb-1.5">Network mode</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSettings({ ...settings, networkMode: "ONLINE" })}
                className={`rounded-xl border p-4 text-left ${
                  settings.networkMode === "ONLINE" ? "border-coral-500 bg-coral-500/10" : "border-white/10 bg-white/5"
                }`}
              >
                <Cloud className="h-5 w-5 text-coral-400 mb-2" />
                <div className="font-semibold">Online</div>
                <div className="text-xs text-white/60">Cloud server</div>
              </button>
              <button
                onClick={() => setSettings({ ...settings, networkMode: "LOCAL" })}
                className={`rounded-xl border p-4 text-left ${
                  settings.networkMode === "LOCAL" ? "border-coral-500 bg-coral-500/10" : "border-white/10 bg-white/5"
                }`}
              >
                <Wifi className="h-5 w-5 text-coral-400 mb-2" />
                <div className="font-semibold">Local Wi-Fi</div>
                <div className="text-xs text-white/60">Connect to sale point</div>
              </button>
            </div>
          </div>

          {settings.networkMode === "LOCAL" && settings.type === "SALE_POINT" && (
            <div className="rounded-xl bg-coral-500/10 border border-coral-500/30 p-4 text-sm">
              This kiosk is the <strong>local server</strong> at <code className="font-mono">{autoIp || "auto"}</code>.
              Other gallery kiosks should be configured to point at this address.
            </div>
          )}

          {settings.networkMode === "LOCAL" && settings.type !== "SALE_POINT" && (
            <div>
              <label className="block">
                <div className="label-xs text-white/60 mb-1.5">Sale-point IP</div>
                <input
                  className="input !text-navy-900"
                  value={settings.serverIp}
                  onChange={(e) => setSettings({ ...settings, serverIp: e.target.value })}
                  placeholder="192.168.1.100"
                />
              </label>
              <button
                type="button"
                className="btn-secondary w-full mt-2"
                onClick={async () => {
                  const ip = settings.serverIp.trim();
                  if (!ip) return;
                  try {
                    const r = await fetch(`http://${ip}:3000/api/local/status`);
                    const j = await r.json();
                    alert(`✅ Connected: ${j.name || "Sale Point"}`);
                  } catch (e: any) {
                    alert(`❌ Cannot reach ${ip}: ${e?.message || "unknown"}`);
                  }
                }}
              >
                Test connection
              </button>
            </div>
          )}

        </div>

        {/* ── NETWORK SECTION ── */}
        <div className="card !bg-white/5 !border-white/10 p-6 space-y-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Network className="h-5 w-5 text-coral-400" />
            <h2 className="font-display text-xl">Network</h2>
          </div>

          <div>
            <div className="label-xs text-white/60 mb-1.5">Connection type</div>
            <div className="grid grid-cols-3 gap-3">
              {(["LAN", "WIFI", "BOTH"] as ConnectionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setNet("connectionType", t)}
                  className={`rounded-xl border p-3 text-sm font-semibold ${
                    settings.network.connectionType === t
                      ? "border-coral-500 bg-coral-500/10 text-white"
                      : "border-white/10 bg-white/5 text-white/60"
                  }`}
                >
                  {t === "LAN" ? "LAN (Ethernet)" : t === "WIFI" ? "WiFi only" : "Both (redundant)"}
                </button>
              ))}
            </div>
          </div>

          {settings.network.connectionType !== "WIFI" && (
            <label className="block">
              <div className="label-xs text-white/60 mb-1.5">LAN IP address</div>
              <input
                className="input !text-navy-900"
                value={settings.network.lanIp}
                onChange={(e) => setNet("lanIp", e.target.value)}
                placeholder="192.168.1.100"
              />
            </label>
          )}

          {settings.network.connectionType !== "LAN" && (
            <>
              <label className="block">
                <div className="label-xs text-white/60 mb-1.5">WiFi SSID</div>
                <input
                  className="input !text-navy-900"
                  value={settings.network.wifiSsid}
                  onChange={(e) => setNet("wifiSsid", e.target.value)}
                  placeholder="Pixelvo-5G"
                />
              </label>
              <label className="block">
                <div className="label-xs text-white/60 mb-1.5">WiFi password</div>
                <input
                  type="password"
                  className="input !text-navy-900"
                  value={settings.network.wifiPassword}
                  onChange={(e) => setNet("wifiPassword", e.target.value)}
                  placeholder="••••••••"
                />
              </label>
            </>
          )}

          {settings.network.connectionType === "BOTH" && (
            <div>
              <div className="label-xs text-white/60 mb-1.5">Failover priority</div>
              <div className="grid grid-cols-2 gap-3">
                {(["LAN", "WIFI"] as NetworkPriority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNet("priority", p)}
                    className={`rounded-xl border p-3 text-sm font-semibold ${
                      settings.network.priority === p
                        ? "border-coral-500 bg-coral-500/10 text-white"
                        : "border-white/10 bg-white/5 text-white/60"
                    }`}
                  >
                    Prefer {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Test Connection */}
          <button
            type="button"
            className="btn-secondary w-full"
            disabled={testBusy}
            onClick={testConnections}
          >
            {testBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
            Test connections
          </button>

          {(testResult.lan !== null || testResult.wifi !== null || testResult.cloud !== null) && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 grid grid-cols-3 gap-3 text-center text-xs">
              {settings.network.connectionType !== "WIFI" && (
                <div>
                  <div className="text-white/60 mb-1">LAN</div>
                  <span className={testResult.lan === "ok" ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                    {testResult.lan === "ok" ? "✓ OK" : testResult.lan === "err" ? "✗ Fail" : "—"}
                  </span>
                </div>
              )}
              {settings.network.connectionType !== "LAN" && (
                <div>
                  <div className="text-white/60 mb-1">WiFi</div>
                  <span className={testResult.wifi === "ok" ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                    {testResult.wifi === "ok" ? "✓ OK" : testResult.wifi === "err" ? "✗ Fail" : "—"}
                  </span>
                </div>
              )}
              <div>
                <div className="text-white/60 mb-1">Cloud</div>
                <span className={testResult.cloud === "ok" ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                  {testResult.cloud === "ok" ? "✓ OK" : testResult.cloud === "err" ? "✗ Fail" : "—"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── PHOTO CACHE SECTION ── */}
        <div className="card !bg-white/5 !border-white/10 p-6 space-y-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5 text-coral-400" />
            <h2 className="font-display text-xl">Photo Cache</h2>
          </div>

          {/* Stats */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 grid grid-cols-2 gap-4 text-center text-sm">
            <div>
              <div className="text-white/50 text-xs mb-0.5">Photos cached</div>
              <div className="font-display text-2xl text-white">{cacheStats?.count ?? "—"}</div>
            </div>
            <div>
              <div className="text-white/50 text-xs mb-0.5">Storage used</div>
              <div className="font-display text-2xl text-white">
                {cacheStats ? `${(cacheStats.sizeBytes / 1024 / 1024).toFixed(1)} MB` : "—"}
              </div>
            </div>
          </div>

          {/* Auto-cache toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-semibold text-sm">Auto-cache new galleries</div>
              <div className="text-white/50 text-xs">Automatically cache photos when a gallery is loaded at the kiosk</div>
            </div>
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, autoCache: !s.autoCache }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoCache ? "bg-coral-500" : "bg-white/20"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  settings.autoCache ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="btn-secondary"
              disabled={cacheBusy}
              onClick={handlePreCacheAll}
            >
              {cacheBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Pre-cache all galleries
            </button>
            <button
              type="button"
              className="btn-secondary !border-red-500/30 !text-red-400 hover:!bg-red-500/10"
              disabled={cacheBusy}
              onClick={handleClearCache}
            >
              {cacheBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Clear cache
            </button>
          </div>
        </div>

        <div className="card !bg-white/5 !border-white/10 p-6 space-y-4 text-white">
          <button onClick={save} disabled={busy} className="btn-primary w-full !py-3">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved!" : "Save settings"}
          </button>
          {registered && saved && (
            <div className="text-xs text-green-400 text-center">Registered with cloud KioskConfig.</div>
          )}
        </div>
      </div>
    </div>
  );
}
