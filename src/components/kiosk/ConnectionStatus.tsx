"use client";
import { useEffect, useState } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

type State = "connecting" | "connected" | "offline";

export default function ConnectionStatus({ baseUrl }: { baseUrl?: string }) {
  const [state, setState] = useState<State>("connecting");
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
          setName(j?.name || "PixelHoliday");
        } else {
          setState("offline");
        }
      } catch {
        if (!cancelled) setState("offline");
      }
    };
    ping();
    const id = setInterval(ping, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [baseUrl]);

  const color =
    state === "connected" ? "bg-green-500" : state === "connecting" ? "bg-amber-500" : "bg-coral-500";
  const Icon = state === "connecting" ? Loader2 : state === "connected" ? Wifi : WifiOff;
  const label =
    state === "connected" ? `Connected · ${name || "Sale Point"}` : state === "connecting" ? "Connecting…" : "Offline";

  return (
    <div className="fixed top-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/15 px-3 py-1.5 text-xs text-white">
      <span className={`relative flex h-2 w-2`}>
        <span className={`absolute inline-flex h-2 w-2 rounded-full ${color} animate-ping opacity-60`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
      </span>
      <Icon className={`h-3 w-3 ${state === "connecting" ? "animate-spin" : ""}`} />
      <span>{label}</span>
    </div>
  );
}
