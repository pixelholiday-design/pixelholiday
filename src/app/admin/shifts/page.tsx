"use client";
import { useEffect, useMemo, useState } from "react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, Loader2 } from "lucide-react";

type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  user: { id: string; name: string; role: string };
};

// Deterministic color by locationId
const LOCATION_COLORS = [
  "bg-coral-100 text-coral-800 border-coral-200",
  "bg-brand-100 text-brand-800 border-brand-200",
  "bg-gold-100 text-gold-800 border-gold-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-sky-100 text-sky-800 border-sky-200",
];

function locationColor(locationId: string, colorMap: Record<string, string>) {
  return colorMap[locationId] || LOCATION_COLORS[0];
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  // Base week start adjusted by offset
  const baseWeekStart = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return weekOffset >= 0
      ? addWeeks(start, weekOffset)
      : subWeeks(start, -weekOffset);
  }, [weekOffset]);

  const week = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(baseWeekStart, i)),
    [baseWeekStart]
  );

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/shifts").then((r) => r.json()).catch(() => ({ shifts: [] }));
    setShifts(res.shifts || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Build deterministic color map: locationId → CSS class
  const colorMap = useMemo(() => {
    const ids = Array.from(new Set(shifts.map((s) => s.locationId)));
    const map: Record<string, string> = {};
    ids.forEach((id, i) => {
      map[id] = LOCATION_COLORS[i % LOCATION_COLORS.length];
    });
    return map;
  }, [shifts]);

  // Group shifts per day
  function shiftsOnDay(day: Date) {
    return shifts.filter((s) => isSameDay(new Date(s.date), day));
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Team</div>
          <h1 className="heading text-4xl mt-1">Shift Calendar</h1>
          <p className="text-navy-400 mt-1 text-sm">Weekly view — colour-coded by location.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="btn-ghost !p-2"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-white shadow-card border border-cream-300/60 px-4 py-2 text-sm font-medium text-navy-700">
            <CalendarDays className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
            {format(baseWeekStart, "d MMM")} – {format(addDays(baseWeekStart, 6), "d MMM yyyy")}
          </div>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="btn-ghost !p-2"
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="btn-secondary text-xs px-3 py-1.5">
              Today
            </button>
          )}
        </div>
      </header>

      {/* Legend */}
      {Object.keys(colorMap).length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(colorMap).map(([locId, cls]) => {
            const sample = shifts.find((s) => s.locationId === locId);
            return (
              <span key={locId} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium ${cls}`}>
                <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                {(sample as any)?.location?.name || locId.slice(0, 8)}
              </span>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="card p-16 text-center text-navy-400">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {week.map((day) => {
            const dayShifts = shiftsOnDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`card p-3 min-h-[220px] ${isToday ? "ring-2 ring-brand-400" : ""}`}
              >
                <div className={`font-medium text-sm border-b border-cream-300/70 pb-2 mb-2 ${isToday ? "text-brand-700" : "text-navy-900"}`}>
                  {format(day, "EEE")}
                  <div className="text-xs text-navy-400">{format(day, "d MMM")}</div>
                </div>
                <div className="space-y-1.5">
                  {dayShifts.length === 0 && (
                    <div className="text-[11px] text-navy-300 italic">—</div>
                  )}
                  {dayShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className={`rounded-lg border px-2 py-1.5 text-[11px] ${locationColor(shift.locationId, colorMap)}`}
                    >
                      <div className="font-semibold truncate">{shift.user.name}</div>
                      <div className="opacity-70 mt-0.5">
                        {format(new Date(shift.startTime), "HH:mm")}
                        {" – "}
                        {format(new Date(shift.endTime), "HH:mm")}
                      </div>
                      <div className="opacity-60 text-[10px]">{shift.user.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && shifts.length === 0 && (
        <div className="text-center text-navy-400 text-sm py-4">
          No shifts scheduled. Create shifts via the Staff API to see them here.
        </div>
      )}
    </div>
  );
}
