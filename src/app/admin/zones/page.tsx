"use client";
import { useEffect, useState } from "react";

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
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Zone Rotations</h1>
      <p className="text-sm text-gray-600 mb-6">
        Outdoor photographers must rotate every 4 hours. Red = over 4h.
      </p>
      {loading ? (
        <p>Loading...</p>
      ) : assignments.length === 0 ? (
        <p className="text-gray-500">No active zone assignments.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div
              key={a.id}
              className={
                "p-4 rounded-lg border " +
                (a.critical
                  ? "bg-red-100 border-red-500 animate-pulse"
                  : a.warning
                  ? "bg-yellow-100 border-yellow-500"
                  : "bg-white border-gray-200")
              }
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{a.photographer.name}</div>
                  <div className="text-sm text-gray-600">
                    {a.zoneName} {a.isOutdoor ? "(outdoor)" : "(indoor)"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{a.durationMinutes}m</div>
                  {a.critical && <div className="text-red-700 text-sm">ROTATE NOW</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
