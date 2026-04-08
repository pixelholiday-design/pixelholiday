"use client";

import { useEffect, useState } from "react";

export default function UploadCoach({ photoIds }: { photoIds: string[] }) {
  const [data, setData] = useState<{
    varietyCount: number;
    varietyState: string;
    tips: string[];
    recommendedHookPhotoId: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (photoIds.length === 0) return;
    setLoading(true);
    fetch("/api/ai/upload-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoIds }),
    })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [photoIds]);

  if (photoIds.length === 0) return null;
  if (loading) return <div className="p-3 text-sm opacity-70">AI coach analyzing…</div>;
  if (!data) return null;

  const varietyColor =
    data.varietyState === "good"
      ? "bg-green-100 text-green-800"
      : data.varietyState === "ok"
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-800";

  return (
    <aside className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">AI Upload Coach</h4>
      <div className="mb-3">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${varietyColor}`}>
          Pose variety: {data.varietyCount} categor{data.varietyCount === 1 ? "y" : "ies"}
        </span>
      </div>
      {data.tips.length > 0 && (
        <ul className="mb-3 space-y-1 text-sm">
          {data.tips.map((t, i) => (
            <li key={i} className="opacity-80">
              • {t}
            </li>
          ))}
        </ul>
      )}
      {data.recommendedHookPhotoId && (
        <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
          Recommended hook: photo {data.recommendedHookPhotoId.slice(-6)}
        </div>
      )}
    </aside>
  );
}
