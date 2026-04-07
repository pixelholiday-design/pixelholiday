"use client";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function FomoTimer({ expiresAt }: { expiresAt: string | Date }) {
  const target = new Date(expiresAt).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  if (diff === 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-navy-900/10 text-navy-600 px-4 py-1.5 text-xs font-semibold">
        <Clock className="h-3.5 w-3.5" /> Gallery expired
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-white/90 backdrop-blur border border-gold-400/40 shadow-card px-4 py-1.5">
      <Clock className="h-3.5 w-3.5 text-gold-600" />
      <span className="text-[10px] uppercase tracking-widest font-semibold text-navy-400">Available for</span>
      <div className="flex items-center gap-1.5 font-display text-sm text-navy-900">
        <Seg value={d} label="d" />
        <span className="text-navy-300">:</span>
        <Seg value={h} label="h" />
        <span className="text-navy-300">:</span>
        <Seg value={m} label="m" />
        <span className="text-navy-300">:</span>
        <Seg value={s} label="s" />
      </div>
    </div>
  );
}

function Seg({ value, label }: { value: number; label: string }) {
  return (
    <span className="tabular-nums">
      {String(value).padStart(2, "0")}
      <span className="text-[10px] text-navy-400 ml-0.5">{label}</span>
    </span>
  );
}
