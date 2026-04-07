"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState<"sales" | "uploads" | "rate" | "rating">("rating");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    fetch(`/api/admin/staff?${params}`).then((r) => r.json()).then((d) => setStaff(d.staff || []));
  }, [q, role]);

  const enriched = staff.map((u) => {
    const uploaded = u.galleries?.length || 0;
    const sold = u.galleries?.filter((g: any) => g.purchasedCount > 0).length || 0;
    const rate = uploaded ? sold / uploaded : 0;
    const equipCost = u.equipmentAssignments?.reduce((s: number, a: any) => s + (a.equipment?.purchaseCost || 0), 0) || 0;
    const totalCost = (u.salary || 0) + (u.housing?.monthlyCost || 0) + equipCost;
    return { ...u, uploaded, sold, rate, totalCost };
  });

  const sorted = [...enriched].sort((a, b) => {
    if (sort === "sales") return b.sold - a.sold;
    if (sort === "uploads") return b.uploaded - a.uploaded;
    if (sort === "rate") return b.rate - a.rate;
    return b.rating - a.rating;
  });

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Staff Management</h1>
      <div className="flex gap-2">
        <input className="border p-2 rounded" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="border p-2 rounded" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="PHOTOGRAPHER">Photographer</option>
          <option value="SUPERVISOR">Supervisor</option>
          <option value="OPERATIONS_MANAGER">Operations Manager</option>
          <option value="SALES_STAFF">Sales</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="CEO">CEO</option>
        </select>
        <select className="border p-2 rounded" value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="rating">Sort: Rating</option>
          <option value="sales">Sort: Sales</option>
          <option value="uploads">Sort: Uploads</option>
          <option value="rate">Sort: Conversion</option>
        </select>
      </div>

      <h2 className="font-semibold mt-4">Performance Leaderboard</h2>
      <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2">Name</th>
            <th>Role</th>
            <th>Repeater</th>
            <th>Level/XP</th>
            <th>Uploaded</th>
            <th>Sold</th>
            <th>Rate</th>
            <th>Rating</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2"><Link href={`/admin/staff/${u.id}`} className="text-blue-600">{u.name}</Link></td>
              <td>{u.role}</td>
              <td>{u.isRepeater && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">+{u.repeaterYears}y</span>}</td>
              <td>L{u.level} ({u.xp})</td>
              <td>{u.uploaded}</td>
              <td>{u.sold}</td>
              <td>{(u.rate * 100).toFixed(0)}%</td>
              <td>{u.rating?.toFixed(1)}</td>
              <td>€{u.totalCost.toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
