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
  return (
    <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 rounded-full px-3 py-1 text-xs font-medium">
      <Clock size={14} /> {diff === 0 ? "Expired" : `${d}d ${h}h ${m}m ${s}s left`}
    </div>
  );
}
