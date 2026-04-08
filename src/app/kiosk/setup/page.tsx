"use client";
import { useEffect, useState } from "react";
import { Save, Loader2, Wifi, Cloud, Settings as Cog, Check } from "lucide-react";

type Settings = {
  name: string;
  type: "SALE_POINT" | "GALLERY_DISPLAY" | "TV_DISPLAY" | "SD_UPLOAD";
  locationId: string;
  networkMode: "ONLINE" | "LOCAL";
  serverIp: string;
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

export default function KioskSetupPage() {
  const [settings, setSettings] = useState<Settings>({
    name: "",
    type: "GALLERY_DISPLAY",
    locationId: "",
    networkMode: "ONLINE",
    serverIp: "",
  });
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [saved, setSaved] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [autoIp, setAutoIp] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadFromStorage();
    if (existing) setSettings(existing);
  }, []);

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
