"use client";
import { useEffect, useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import SkillRadar from "@/components/ai/SkillRadar";

export default function StaffDetail({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/admin/staff/${params.id}`).then((r) => r.json()).then((d) => setUser(d.user));
  }, [params.id]);
  if (!user) return <div className="p-8">Loading…</div>;

  // Repeater salary calc: base + (years * 100), max +1500
  const repeaterBonus = Math.min(user.repeaterYears * 100, 1500);

  const weekStart = startOfWeek(new Date());
  const week = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const shifts = user.shifts || [];

  return (
    <div className="space-y-6">
      <header>
        <div className="label-xs">Staff</div>
        <h1 className="heading text-4xl mt-1">{user.name}</h1>
        <div className="text-navy-400 mt-1">{user.role} · {user.location?.name}</div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Level / XP" value={`L${user.level} (${user.xp} XP)`} />
        <Card title="Rating" value={user.rating?.toFixed(1) || "0.0"} />
        <Card title="Salary" value={`€${user.salary || 0} +€${repeaterBonus}`} />
      </div>

      <div className="card p-5">
        <h2 className="heading text-lg mb-3">Badges</h2>
        <div className="flex gap-2 flex-wrap">
          {(user.badges || []).map((b: string) => (
            <span key={b} className="bg-gold-500/10 text-gold-700 px-3 py-1 rounded-full text-xs font-medium">{b}</span>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="heading text-lg mb-3">Weekly Shift Calendar</h2>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {week.map((d) => {
            const day = shifts.filter((s: any) => format(new Date(s.date), "yyyy-MM-dd") === format(d, "yyyy-MM-dd"));
            return (
              <div key={d.toISOString()} className="border border-cream-300 p-2 min-h-[80px] rounded-lg">
                <div className="font-semibold text-navy-700">{format(d, "EEE d")}</div>
                {day.map((s: any) => (
                  <div key={s.id} className="bg-brand-50 text-brand-700 mt-1 p-1 rounded text-[10px]">{format(new Date(s.startTime), "HH:mm")}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="heading text-lg mb-3">Equipment</h2>
        <ul className="text-sm space-y-1">
          {user.equipmentAssignments?.map((a: any) => (
            <li key={a.id} className="text-navy-700">{a.equipment.name} <span className="text-navy-400">(€{a.equipment.purchaseCost || 0})</span></li>
          ))}
        </ul>
      </div>

      <div className="card p-5">
        <h2 className="heading text-lg mb-3">Housing</h2>
        {user.housing ? (
          <div className="text-navy-700">{user.housing.address} <span className="text-navy-400">— €{user.housing.monthlyCost}/mo</span></div>
        ) : (
          <div className="text-navy-400">No housing assigned</div>
        )}
      </div>

      <SkillRadar userId={params.id} />

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Commissions ({user.commissions?.length || 0})</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Month</th>
              <th className="px-5 py-3">Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-300/70">
            {user.commissions?.map((c: any) => (
              <tr key={c.id} className="hover:bg-cream-100/60">
                <td className="px-5 py-3 text-navy-700">{c.type}</td>
                <td className="px-5 py-3 font-semibold text-navy-900">€{c.amount.toFixed(2)}</td>
                <td className="px-5 py-3 text-navy-500">{c.month}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex rounded-full text-xs font-semibold px-2.5 py-1 ${c.isPaid ? "bg-green-50 text-green-700" : "bg-cream-200 text-navy-500"}`}>
                    {c.isPaid ? "Paid" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="label-xs">{title}</div>
      <div className="font-display text-2xl text-navy-900">{value}</div>
    </div>
  );
}
