"use client";

import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";

export default function TrialBanner() {
  const [trial, setTrial] = useState<{ isActive: boolean; daysRemaining: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/subscription/trial-status")
      .then((r) => r.json())
      .then((d) => {
        if (d.trial) setTrial(d.trial);
      })
      .catch(() => {});
  }, []);

  if (!trial?.isActive || dismissed) return null;

  const urgency = trial.daysRemaining <= 3 ? "from-red-500 to-orange-500" : "from-brand-500 to-brand-600";

  return (
    <div className={`relative rounded-xl bg-gradient-to-r ${urgency} px-4 py-3 text-white mb-4`}>
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 shrink-0" />
        <div className="flex-1 text-sm">
          <span className="font-semibold">{trial.daysRemaining} day{trial.daysRemaining !== 1 ? "s" : ""}</span> left in your free trial.
          {trial.daysRemaining <= 3 && " Upgrade now to keep your premium features!"}
        </div>
        <Link
          href="/dashboard/settings"
          className="shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30 transition-colors"
        >
          Upgrade
        </Link>
        <button onClick={() => setDismissed(true)} className="shrink-0 p-1 hover:bg-white/20 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
