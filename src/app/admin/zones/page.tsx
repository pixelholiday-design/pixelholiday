"use client";
import { useEffect, useState } from "react";
import { MapPin, AlertTriangle, Clock, Loader2 } from "lucide-react";

type Assignment = {
  id: string;
  zoneName: string;
  durationMinutes: number;
  warning: boolean;
  critical: boolean;
  isOutdoor: boolean;
  photographer: { id: string; name: string };
};

export default function ZonesPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/zones/active");
    const j = await r.json();
    setAssignments(j.assignments ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <div className="label-xs">Operations</div>
        <h1 className="heading text-4xl mt-1">Zone Rotations</h1>
        <p className="text-navy-400 mt-1">Outdoor photographers must rotate every 4 hours. Red = overdue rotation.</p>
      </header>

      {loading ? (
        <div className="card p-16 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-400 mx-auto" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="card p-10 text-center">
          <MapPin className="h-8 w-8 mx-auto text-navy-300 mb-3" />
          <div className="text-navy-500">No active zone assignments.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div
              key={a.id}
              className={`card p-5 flex items-center justify-between gap-4 ${
                a.critical
                  ? "ring-2 ring-coral-500 bg-coral-50"
                  : a.warning
                  ? "ring-2 ring-gold-500 bg-gold-500/5"
                  : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  a.critical ? "bg-coral-500 text-white" : a.warning ? "bg-gold-500 text-white" : "bg-brand-50 text-brand-700"
                }`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-navy-900">{a.photographer.name}</div>
                  <div className="text-sm text-navy-400">
                    {a.zoneName} · {a.isOutdoor ? "Outdoor" : "Indoor"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl text-navy-900 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-navy-400" />
                  {a.durationMinutes}m
                </div>
                {a.critical && (
                  <div className="inline-flex items-center gap-1 text-xs text-coral-700 bg-coral-100 px-2 py-0.5 rounded-full font-medium mt-1">
                    <AlertTriangle className="h-3 w-3" /> ROTATE NOW
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
