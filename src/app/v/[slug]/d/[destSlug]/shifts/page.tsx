"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Loader2, ChevronLeft, ChevronRight, Clock,
} from "lucide-react";

type OrgInfo = {
  id: string;
  name: string;
  brandName: string | null;
  brandPrimaryColor: string | null;
};

type Destination = {
  id: string;
  name: string;
  slug: string;
  venueType: string;
};

type Shift = {
  id: string;
  userId: string;
  locationId: string;
  date: string;
  startTime: string;
  endTime: string;
  user: { id: string; name: string; email: string };
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DestinationShiftsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const destSlug = params.destSlug as string;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const primaryColor = org?.brandPrimaryColor || "#0EA5A5";

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, shiftsRes] = await Promise.all([
          fetch(`/api/v/${slug}/dashboard`),
          fetch("/api/admin/shifts"),
        ]);
        if (!dashRes.ok) { router.push(`/v/${slug}`); return; }
        const dashData = await dashRes.json();
        const shiftsData = shiftsRes.ok ? await shiftsRes.json() : { shifts: [] };

        setOrg(dashData.org);
        const dest = (dashData.destinations || []).find(
          (d: Destination) => d.slug === destSlug
        );
        setDestination(dest || null);

        // Filter shifts for this destination's locationId if available
        setShifts(shiftsData.shifts || []);
      } catch {
        router.push(`/v/${slug}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, destSlug, router]);

  function navigateWeek(direction: number) {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + direction * 7);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  // Build week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weekLabel = `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  // Group shifts by day
  function getShiftsForDay(date: Date): Shift[] {
    const dateStr = formatDate(date);
    return shifts.filter((s) => s.date.slice(0, 10) === dateStr);
  }

  const today = formatDate(new Date());

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/v/${slug}/d/${destSlug}`}
            className="text-xs text-navy-400 hover:text-brand-500 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back to {destination?.name || "Destination"}
          </Link>
          <h1 className="font-display text-2xl text-navy-900">Shift Calendar</h1>
          {destination && (
            <p className="text-sm text-navy-400">{destination.name}</p>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 rounded-xl hover:bg-cream-200 text-navy-600 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" style={{ color: primaryColor }} />
            <span className="font-display text-lg text-navy-900">{weekLabel}</span>
          </div>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 rounded-xl hover:bg-cream-200 text-navy-600 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {weekDays.map((day, i) => {
            const isToday = formatDate(day) === today;
            return (
              <div
                key={i}
                className={`text-center p-2 rounded-t-xl ${
                  isToday ? "text-white" : "text-navy-600 bg-cream-200"
                }`}
                style={isToday ? { background: primaryColor } : {}}
              >
                <div className="text-xs font-medium">{DAY_NAMES[i]}</div>
                <div className="text-sm font-display">{day.getDate()}</div>
              </div>
            );
          })}

          {/* Day columns */}
          {weekDays.map((day, i) => {
            const dayShifts = getShiftsForDay(day);
            const isToday = formatDate(day) === today;
            return (
              <div
                key={`col-${i}`}
                className="card min-h-[120px] p-2 rounded-t-none"
                style={isToday ? { boxShadow: `inset 0 0 0 2px ${primaryColor}` } : {}}
              >
                {dayShifts.length === 0 ? (
                  <div className="text-xs text-navy-300 text-center mt-4">
                    No shifts
                  </div>
                ) : (
                  <div className="space-y-1">
                    {dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="p-1.5 rounded-lg text-xs"
                        style={{
                          background: primaryColor + "15",
                          color: primaryColor,
                        }}
                      >
                        <div className="font-medium truncate">
                          {shift.user?.name || "Staff"}
                        </div>
                        <div className="flex items-center gap-0.5 opacity-80">
                          <Clock className="h-2.5 w-2.5" />
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
