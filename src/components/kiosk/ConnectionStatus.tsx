"use client";
import { useEffect, useState } from "react";
import { Wifi, WifiOff, Network, Loader2 } from "lucide-react";
import { loadKioskSettings, checkConnectivity, ConnectivityStatus } from "@/lib/kiosk-mode";

type SingleState = "connecting" | "connected" | "offline";

/** Legacy single-indicator used when no NetworkConfig is stored. */
function SingleIndicator({ baseUrl }: { baseUrl?: string }) {
  const [state, setState] = useState<SingleState>("connecting");
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const url = `${baseUrl || ""}/api/local/status`;
    let cancelled = false;
    const ping = async () => {
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (cancelled) return;
        if (r.ok) {
          const j = await r.json();
          setState("connected");
          setName(j?.name || "Pixelvo");
        } else {
          setState("offline");
        }
      } catch {
        if (!cancelled) setState("offline");
      }
    };
    ping();
    const id = setInterval(ping, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, [baseUrl]);

  const color =
    state === "connected" ? "bg-green-500" : state === "connecting" ? "bg-amber-500" : "bg-coral-500";
  const Icon = state === "connecting" ? Loader2 : state === "connected" ? Wifi : WifiOff;
  const label =
    state === "connected" ? `Connected · ${name || "Sale Point"}` : state === "connecting" ? "Connecting…" : "Offline";

  return (
    <div className="fixed top-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/15 px-3 py-1.5 text-xs text-white">
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-2 w-2 rounded-full ${color} animate-ping opacity-60`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
      </span>
      <Icon className={`h-3 w-3 ${state === "connecting" ? "animate-spin" : ""}`} />
      <span>{label}</span>
    </div>
  );
}

function dot(state: "connected" | "offline" | "checking") {
  return state === "connected"
    ? "bg-green-500"
    : state === "checking"
    ? "bg-amber-500"
    : "bg-red-500";
}

/** Dual LAN + WiFi indicator shown when NetworkConfig is present. */
function DualIndicator() {
  const settings = loadKioskSettings();
  const [status, setStatus] = useState<ConnectivityStatus>({
    lan: "checking",
    wifi: "checking",
    active: "none",
  });

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const s = await checkConnectivity(settings);
      if (!cancelled) setStatus(s);
    };
    check();
    const id = setInterval(check, 10000);
    return () => { cancelled = true; clearInterval(id); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const net = settings?.network;
  const showLan = net?.connectionType !== "WIFI";
  const showWifi = net?.connectionType !== "LAN";

  const activeLabel =
    status.active === "lan"
      ? "LAN active"
      : status.active === "wifi"
      ? "WiFi active"
      : status.active === "cloud"
      ? "Cloud"
      : "No connection";

  const activeColor =
    status.active !== "none" ? "text-green-400" : "text-red-400";

  return (
    <div className="fixed top-4 right-4 z-30 inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur border border-white/15 px-3 py-1.5 text-xs text-white">
      {showLan && (
        <span className="inline-flex items-center gap-1.5" title={`LAN: ${status.lan}`}>
          <Network className="h-3 w-3 text-white/70" />
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-2 w-2 rounded-full ${dot(status.lan)} ${status.lan === "checking" ? "animate-ping opacity-60" : ""}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${dot(status.lan)}`} />
          </span>
          <span className="text-white/60">LAN</span>
        </span>
      )}
      {showLan && showWifi && <span className="text-white/20">|</span>}
      {showWifi && (
        <span className="inline-flex items-center gap-1.5" title={`WiFi: ${status.wifi}`}>
          <Wifi className="h-3 w-3 text-white/70" />
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-2 w-2 rounded-full ${dot(status.wifi)} ${status.wifi === "checking" ? "animate-ping opacity-60" : ""}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${dot(status.wifi)}`} />
          </span>
          <span className="text-white/60">WiFi</span>
        </span>
      )}
      <span className={`font-semibold ${activeColor}`}>{activeLabel}</span>
      {status.active !== "none" && status.active !== "cloud" && (
        <span className="text-white/40 text-[10px] uppercase tracking-wider">
          via {net?.priority === "LAN" ? "LAN" : "WiFi"}-priority
        </span>
      )}
    </div>
  );
}

export default function ConnectionStatus({ baseUrl }: { baseUrl?: string }) {
  // Determine on the client which indicator variant to render.
  // useState with lazy init avoids SSR/hydration mismatch.
  const [hasDual] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const s = loadKioskSettings();
    return !!(s?.network?.connectionType);
  });

  if (hasDual) return <DualIndicator />;
  return <SingleIndicator baseUrl={baseUrl} />;
}
