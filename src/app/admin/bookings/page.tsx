"use client";
import { useEffect, useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

export default function BookingsPage() {
  const [appts, setAppts] = useState<any[]>([]);
  const [view, setView] = useState<"week" | "day">("week");
  const [filter, setFilter] = useState({ source: "", status: "", locationId: "" });

  useEffect(() => {
    fetch("/api/admin/bookings").then((r) => r.json()).then((d) => setAppts(d.appointments || []));
  }, []);

  const filtered = appts.filter((a) => {
    if (filter.source && a.source !== filter.source) return false;
    if (filter.status && a.status !== filter.status) return false;
    if (filter.locationId && a.gallery?.locationId !== filter.locationId) return false;
    return true;
  });

  const weekStart = startOfWeek(new Date());
  const week = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Booking Management</h1>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setView("week")} className={`px-3 py-1 rounded ${view === "week" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Week</button>
        <button onClick={() => setView("day")} className={`px-3 py-1 rounded ${view === "day" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Day</button>
        <select className="border p-1 rounded" value={filter.source} onChange={(e) => setFilter({ ...filter, source: e.target.value })}>
          <option value="">All sources</option>
          <option>HOOK_GALLERY</option><option>QR_CODE</option><option>VIP_BOOKING</option>
          <option>WALK_IN</option><option>PRE_ARRIVAL</option><option>WEBSITE</option>
        </select>
        <select className="border p-1 rounded" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All statuses</option>
          <option>PENDING</option><option>CONFIRMED</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>NO_SHOW</option>
        </select>
      </div>

      {view === "week" ? (
        <div className="grid grid-cols-7 gap-2">
          {week.map((d) => {
            const day = filtered.filter((a) => isSameDay(new Date(a.scheduledTime), d));
            return (
              <div key={d.toISOString()} className="bg-white rounded shadow p-2 min-h-[200px]">
                <div className="font-semibold border-b pb-1">{format(d, "EEE d MMM")}</div>
                {day.map((a) => (
                  <div key={a.id} className="mt-2 text-xs bg-blue-50 p-2 rounded">
                    <div>{format(new Date(a.scheduledTime), "HH:mm")}</div>
                    <div>{a.assignedPhotographer?.name}</div>
                    <div className="text-gray-500">{a.source}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded shadow p-4">
          {filtered.filter((a) => isSameDay(new Date(a.scheduledTime), new Date())).map((a) => (
            <div key={a.id} className="border-b py-2">
              {format(new Date(a.scheduledTime), "HH:mm")} — {a.assignedPhotographer?.name} ({a.source}) — {a.status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
