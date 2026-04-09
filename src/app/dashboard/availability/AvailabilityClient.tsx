"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Ban,
  CalendarCheck,
  Trash2,
  X,
  Save,
  RotateCcw,
  Loader2,
} from "lucide-react";

type AvailabilityRecord = {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isRecurring: boolean;
  dayOfWeek: number | null;
  notes: string | null;
  createdAt: string;
};

type Props = {
  availability: AvailabilityRecord[];
  userId: string;
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_OPTIONS: string[] = [];
for (let h = 8; h <= 20; h++) {
  TIME_OPTIONS.push(`${h.toString().padStart(2, "0")}:00`);
  if (h < 20) TIME_OPTIONS.push(`${h.toString().padStart(2, "0")}:30`);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function AvailabilityClient({ availability: initial, userId }: Props) {
  const [records, setRecords] = useState<AvailabilityRecord[]>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar state
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Modal form state
  const [modalAvailable, setModalAvailable] = useState(true);
  const [modalStart, setModalStart] = useState("09:00");
  const [modalEnd, setModalEnd] = useState("17:00");
  const [modalNotes, setModalNotes] = useState("");

  // Recurring schedule state
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringDays, setRecurringDays] = useState<
    { enabled: boolean; start: string; end: string }[]
  >(DAY_NAMES.map(() => ({ enabled: false, start: "09:00", end: "17:00" })));

  // Build a map of date -> record for quick lookup
  const recordMap = useMemo(() => {
    const map: Record<string, AvailabilityRecord> = {};
    for (const r of records) {
      const key = r.date.split("T")[0];
      map[key] = r;
    }
    return map;
  }, [records]);

  // Refresh records from API
  const refreshRecords = useCallback(async () => {
    try {
      const res = await fetch(`/api/marketplace/availability?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.availability || []);
      }
    } catch {
      // silent
    }
  }, [userId]);

  // Calendar helpers
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-start
  const daysInMonth = lastDay.getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  function getDayStatus(day: number): "available" | "blocked" | "none" {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    const record = recordMap[dateStr];
    if (!record) return "none";
    return record.isAvailable ? "available" : "blocked";
  }

  function hasBooking(day: number): boolean {
    // Placeholder: in production, you'd check MarketplaceBooking
    return false;
  }

  function openDayModal(day: number) {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    const record = recordMap[dateStr];
    setSelectedDate(dateStr);
    setModalAvailable(record ? record.isAvailable : true);
    setModalStart(record?.startTime || "09:00");
    setModalEnd(record?.endTime || "17:00");
    setModalNotes(record?.notes || "");
    setModalOpen(true);
  }

  // API calls
  async function saveDayAvailability() {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/marketplace/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          date: selectedDate,
          startTime: modalStart,
          endTime: modalEnd,
          isAvailable: modalAvailable,
          notes: modalNotes || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      await refreshRecords();
      setModalOpen(false);
    } catch {
      setError("Failed to save availability");
    } finally {
      setLoading(false);
    }
  }

  async function deleteDayAvailability() {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/marketplace/availability?userId=${userId}&date=${selectedDate}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete");
      await refreshRecords();
      setModalOpen(false);
    } catch {
      setError("Failed to delete availability");
    } finally {
      setLoading(false);
    }
  }

  async function saveRecurringSchedule() {
    setLoading(true);
    setError(null);
    try {
      const entries: { date: string; startTime: string; endTime: string; isAvailable: boolean }[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 90; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const jsDow = d.getDay(); // 0=Sun
        // Map to our Mon-Sun array: Mon=0..Sun=6
        const idx = jsDow === 0 ? 6 : jsDow - 1;
        const config = recurringDays[idx];
        if (config.enabled) {
          entries.push({
            date: formatDate(d),
            startTime: config.start,
            endTime: config.end,
            isAvailable: true,
          });
        }
      }

      if (entries.length === 0) {
        setError("No days enabled in recurring schedule");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/marketplace/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, entries }),
      });
      if (!res.ok) throw new Error("Failed to save recurring");
      await refreshRecords();
    } catch {
      setError("Failed to save recurring schedule");
    } finally {
      setLoading(false);
    }
  }

  async function blockNext7Days() {
    setLoading(true);
    setError(null);
    try {
      const entries = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        entries.push({
          date: formatDate(d),
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: false,
        });
      }
      const res = await fetch("/api/marketplace/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, entries }),
      });
      if (!res.ok) throw new Error("Failed");
      await refreshRecords();
    } catch {
      setError("Failed to block days");
    } finally {
      setLoading(false);
    }
  }

  async function openNext30Days() {
    setLoading(true);
    setError(null);
    try {
      const entries = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        entries.push({
          date: formatDate(d),
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        });
      }
      const res = await fetch("/api/marketplace/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, entries }),
      });
      if (!res.ok) throw new Error("Failed");
      await refreshRecords();
    } catch {
      setError("Failed to open days");
    } finally {
      setLoading(false);
    }
  }

  async function clearAll() {
    if (!confirm("Are you sure you want to clear all future availability?")) return;
    setLoading(true);
    setError(null);
    try {
      // Delete each record individually
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureRecords = records.filter((r) => {
        const d = parseLocalDate(r.date.split("T")[0]);
        return d >= today;
      });
      for (const r of futureRecords) {
        await fetch(
          `/api/marketplace/availability?userId=${userId}&date=${r.date.split("T")[0]}`,
          { method: "DELETE" }
        );
      }
      await refreshRecords();
    } catch {
      setError("Failed to clear availability");
    } finally {
      setLoading(false);
    }
  }

  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" });
  const todayStr = formatDate(new Date());

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-slate-900">Manage Your Availability</h1>
          <p className="text-sm text-slate-500">
            Set when you are available for bookings. Clients will only see open time slots.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Recurring Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-slate-400" />
              <h2 className="text-base font-semibold text-slate-900">Recurring Weekly Schedule</h2>
            </div>
            <button
              onClick={() => setRecurringEnabled(!recurringEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                recurringEnabled ? "bg-brand-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  recurringEnabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {recurringEnabled && (
            <div className="space-y-3">
              {DAY_NAMES.map((day, idx) => (
                <div key={day} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                  <span className="w-28 text-sm font-medium text-slate-700">{day}</span>
                  <button
                    onClick={() => {
                      const updated = [...recurringDays];
                      updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
                      setRecurringDays(updated);
                    }}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      recurringDays[idx].enabled ? "bg-brand-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        recurringDays[idx].enabled ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                  {recurringDays[idx].enabled && (
                    <>
                      <select
                        value={recurringDays[idx].start}
                        onChange={(e) => {
                          const updated = [...recurringDays];
                          updated[idx] = { ...updated[idx], start: e.target.value };
                          setRecurringDays(updated);
                        }}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span className="text-slate-400 text-sm">to</span>
                      <select
                        value={recurringDays[idx].end}
                        onChange={(e) => {
                          const updated = [...recurringDays];
                          updated[idx] = { ...updated[idx], end: e.target.value };
                          setRecurringDays(updated);
                        }}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              ))}
              <button
                onClick={saveRecurringSchedule}
                disabled={loading}
                className="mt-4 px-5 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Recurring Schedule (Next 90 Days)
              </button>
            </div>
          )}
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              <h2 className="text-base font-semibold text-slate-900">Calendar View</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <span className="text-sm font-medium text-slate-700 w-40 text-center">{monthName}</span>
              <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-brand-100 border border-brand-400" /> Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-400" /> Blocked
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-300" /> No data
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Has booking
            </span>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="h-12" />;
              }
              const status = getDayStatus(day);
              const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
              const isToday = dateStr === todayStr;
              const isPast = parseLocalDate(dateStr) < parseLocalDate(todayStr);
              const booking = hasBooking(day);

              let bgClass = "bg-slate-50 hover:bg-slate-100";
              if (status === "available") bgClass = "bg-brand-50 hover:bg-brand-100 border-brand-200";
              if (status === "blocked") bgClass = "bg-red-50 hover:bg-red-100 border-red-200";
              if (isPast) bgClass = "bg-slate-50 opacity-50";

              return (
                <button
                  key={dateStr}
                  onClick={() => !isPast && openDayModal(day)}
                  disabled={isPast}
                  className={`relative h-12 rounded-lg border text-sm font-medium transition-colors ${bgClass} ${
                    isToday ? "ring-2 ring-brand-500 ring-offset-1" : "border-slate-100"
                  } ${isPast ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span className={`${status === "available" ? "text-brand-700" : status === "blocked" ? "text-red-700" : "text-slate-600"}`}>
                    {day}
                  </span>
                  {booking && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={blockNext7Days}
              disabled={loading}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              Block Next 7 Days
            </button>
            <button
              onClick={openNext30Days}
              disabled={loading}
              className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              Open Next 30 Days
            </button>
            <button
              onClick={clearAll}
              disabled={loading}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Future
            </button>
          </div>
        </div>

        {/* Modal for editing a single day */}
        {modalOpen && selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">
                  {parseLocalDate(selectedDate).toLocaleDateString("default", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Available toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Available</span>
                  <button
                    onClick={() => setModalAvailable(!modalAvailable)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      modalAvailable ? "bg-brand-500" : "bg-red-400"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        modalAvailable ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Time selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Start Time</label>
                    <select
                      value={modalStart}
                      onChange={(e) => setModalStart(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">End Time</label>
                    <select
                      value={modalEnd}
                      onChange={(e) => setModalEnd(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Notes</label>
                  <textarea
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="e.g., Only available for outdoor shoots"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 h-20 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={saveDayAvailability}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                  {recordMap[selectedDate] && (
                    <button
                      onClick={deleteDayAvailability}
                      disabled={loading}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
