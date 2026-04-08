"use client";

import { useEffect, useState } from "react";
import { Sparkles, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";

interface Script {
  id: string;
  scriptName: string;
  script: string;
  timesShown: number;
  timesConverted: number;
  conversionRate: number;
}

interface Props {
  cartItemCount: number;
  cartTotal: number;
  locationType?: "LUXURY" | "SPLASH" | "ATTRACTION";
  hasKids?: boolean;
  has3Generations?: boolean;
  hesitating?: boolean;
}

export default function SalesCoach({
  cartItemCount,
  cartTotal,
  locationType = "LUXURY",
  hasKids = false,
  has3Generations = false,
  hesitating = false,
}: Props) {
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<"worked" | "didnt" | null>(null);

  useEffect(() => {
    if (cartItemCount === 0) {
      setScript(null);
      return;
    }
    setLoading(true);
    setFeedback(null);
    fetch("/api/upsell/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItemCount,
        cartTotal,
        locationType,
        hasKids,
        has3Generations,
        hesitating,
      }),
    })
      .then((r) => r.json())
      .then((d) => setScript(d.script))
      .catch(() => setScript(null))
      .finally(() => setLoading(false));
  }, [cartItemCount, cartTotal, locationType, hasKids, has3Generations, hesitating]);

  async function recordFeedback(worked: boolean) {
    if (!script) return;
    setFeedback(worked ? "worked" : "didnt");
    await fetch("/api/upsell/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scriptId: script.id, worked }),
    }).catch(() => {});
  }

  if (cartItemCount === 0) return null;

  return (
    <aside className="rounded-2xl border border-gold-500/30 bg-gradient-to-br from-gold-500/10 to-coral-500/5 p-4 shadow-lift">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-gold-400" />
        <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400">Sales coach</h4>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-white/60 text-sm py-3">
          <Loader2 className="h-4 w-4 animate-spin" /> Analyzing cart…
        </div>
      )}

      {!loading && script && (
        <>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gold-400 mb-1">
            {script.scriptName}
          </div>
          <p className="text-sm text-white/90 leading-relaxed mb-3 italic">
            &ldquo;{script.script.replace(/\[PHOTO_COUNT\]/g, String(cartItemCount)).replace(/\[ANCHOR_PRICE\]/g, "130")}&rdquo;
          </p>
          {feedback === null ? (
            <div className="flex gap-2">
              <button
                onClick={() => recordFeedback(true)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-semibold py-2 hover:bg-green-500/30 transition"
              >
                <ThumbsUp className="h-3 w-3" /> Worked!
              </button>
              <button
                onClick={() => recordFeedback(false)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs font-semibold py-2 hover:bg-white/10 transition"
              >
                <ThumbsDown className="h-3 w-3" /> Didn&apos;t
              </button>
            </div>
          ) : (
            <div className={`text-xs text-center py-2 rounded-lg ${feedback === "worked" ? "bg-green-500/15 text-green-300" : "bg-white/5 text-white/60"}`}>
              {feedback === "worked" ? "✓ Logged as conversion" : "✓ Feedback noted"}
            </div>
          )}
          {script.timesShown > 0 && (
            <div className="mt-2 text-[10px] text-white/40">
              Used {script.timesShown}× · {Math.round(script.conversionRate * 100)}% conversion
            </div>
          )}
        </>
      )}

      {!loading && !script && (
        <div className="text-xs text-white/40 italic py-2">No script for this cart context.</div>
      )}
    </aside>
  );
}
