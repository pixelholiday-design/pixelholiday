"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, QrCode, Plus, Loader2 } from "lucide-react";

export default function ReceptionistDashboardClient({ user }: { user: { name: string } }) {
  const [data, setData] = useState<any | null>(null);
  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData({ appointments: [] }));
  }, []);
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <Loader2 className="h-6 w-6 animate-spin text-navy-400" />
      </div>
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart.getTime() + 24 * 3600 * 1000);
  const todayBookings = (data.appointments || []).filter((b: any) => {
    const t = new Date(b.scheduledTime).getTime();
    return t >= todayStart.getTime() && t < todayEnd.getTime();
  });
  const upcoming = (data.appointments || [])
    .filter((b: any) => new Date(b.scheduledTime) >= new Date())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-cream-100 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <div className="label-xs">Reception desk</div>
          <h1 className="heading text-4xl mt-1">Hello, {user.name}</h1>
          <p className="text-navy-400 mt-1">Welcome guests and drive bookings with QR cards</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Stat icon={<CalendarCheck className="h-4 w-4" />} label="Bookings today" value={`${todayBookings.length}`} />
          <Stat icon={<QrCode className="h-4 w-4" />} label="QR cards distributed" value="—" sub="Logged at /admin/qr" />
          <Stat icon={<Plus className="h-4 w-4" />} label="New booking" value="Add" sub="Tap below" />
        </div>

        <Link href="/admin/bookings" className="block card p-8 text-center hover:shadow-card-hover transition">
          <div className="font-display text-2xl text-navy-900">Create New Booking</div>
          <div className="text-sm text-navy-400 mt-1">For walk-in guests or phone inquiries</div>
        </Link>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-300/70">
            <h2 className="heading text-lg">Next 3 appointments</h2>
          </div>
          {upcoming.length === 0 ? (
            <div className="p-8 text-center text-navy-400 text-sm">No upcoming appointments.</div>
          ) : (
            <ul className="divide-y divide-cream-300/60">
              {upcoming.map((b: any) => (
                <li key={b.id} className="px-6 py-4">
                  <div className="font-semibold text-navy-900">
                    {b.gallery?.customer?.name || "Customer"}
                  </div>
                  <div className="text-sm text-navy-500">
                    {new Date(b.scheduledTime).toLocaleString()}
                    {b.location?.name && ` · ${b.location.name}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub }: any) {
  return (
    <div className="stat-card">
      <div className="h-9 w-9 rounded-xl bg-brand-500/10 text-brand-700 flex items-center justify-center">{icon}</div>
      <div className="label-xs mt-3">{label}</div>
      <div className="font-display text-3xl text-navy-900">{value}</div>
      {sub && <div className="text-xs text-navy-400 mt-1">{sub}</div>}
    </div>
  );
}
