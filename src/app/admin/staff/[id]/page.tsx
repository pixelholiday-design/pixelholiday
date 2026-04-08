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
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">{user.name}</h1>
      <div className="text-gray-500">{user.role} · {user.location?.name}</div>

      <div className="grid grid-cols-3 gap-4">
        <Card title="Level / XP" value={`L${user.level} (${user.xp} XP)`} />
        <Card title="Rating" value={user.rating?.toFixed(1) || "0.0"} />
        <Card title="Salary" value={`€${user.salary || 0} +€${repeaterBonus}`} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Badges</h2>
        <div className="flex gap-2 flex-wrap">
          {(user.badges || []).map((b: string) => (
            <span key={b} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">🏆 {b}</span>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Weekly Shift Calendar</h2>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {week.map((d) => {
            const day = shifts.filter((s: any) => format(new Date(s.date), "yyyy-MM-dd") === format(d, "yyyy-MM-dd"));
            return (
              <div key={d.toISOString()} className="border p-2 min-h-[80px]">
                <div className="font-semibold">{format(d, "EEE d")}</div>
                {day.map((s: any) => (
                  <div key={s.id} className="bg-blue-100 mt-1 p-1 rounded">{format(new Date(s.startTime), "HH:mm")}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Equipment</h2>
        <ul className="text-sm">
          {user.equipmentAssignments?.map((a: any) => (
            <li key={a.id}>{a.equipment.name} (€{a.equipment.purchaseCost || 0})</li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Housing</h2>
        {user.housing ? (
          <div>{user.housing.address} — €{user.housing.monthlyCost}/mo</div>
        ) : (
          <div className="text-gray-500">No housing assigned</div>
        )}
      </div>

      <SkillRadar userId={params.id} />

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Commissions ({user.commissions?.length || 0})</h2>
        <table className="w-full text-sm">
          <thead><tr><th className="text-left">Type</th><th>Amount</th><th>Month</th><th>Paid</th></tr></thead>
          <tbody>
            {user.commissions?.map((c: any) => (
              <tr key={c.id} className="border-t">
                <td>{c.type}</td>
                <td>€{c.amount.toFixed(2)}</td>
                <td>{c.month}</td>
                <td>{c.isPaid ? "✅" : "⏳"}</td>
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
    <div className="bg-white p-4 rounded shadow">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
