"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import Modal, { Field, inputCls } from "@/components/admin/Modal";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState<"sales" | "uploads" | "rate" | "rating">("rating");
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    const [sRes, lRes] = await Promise.all([
      fetch(`/api/admin/staff?${params}`).then((r) => r.json()),
      fetch("/api/admin/locations").then((r) => r.json()).catch(() => ({ locations: [] })),
    ]);
    setStaff(sRes.staff || []);
    setLocations(lRes.locations || []);
  }

  useEffect(() => {
    load();
  }, [q, role]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const salary = fd.get("salary");
    const body = {
      name: fd.get("name"),
      email: fd.get("email"),
      password: fd.get("password"),
      role: fd.get("role"),
      locationId: fd.get("locationId") || undefined,
      phone: fd.get("phone") || undefined,
      pin: fd.get("pin") || undefined,
      salary: salary ? parseFloat(salary.toString()) : undefined,
    };
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (res.ok) {
      setAddOpen(false);
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to add staff member");
    }
  }

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
    <div className="space-y-6">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Team</div>
          <h1 className="heading text-4xl mt-1">Staff</h1>
          <p className="text-navy-400 mt-1">Performance, costs, and onboarding.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 text-white font-medium text-sm hover:bg-brand-800 min-h-[44px]"
        >
          <Plus className="h-4 w-4" /> Add Staff
        </button>
      </header>

      <div className="flex gap-2 flex-wrap">
        <input className={`${inputCls} max-w-xs`} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={`${inputCls} max-w-xs`} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="PHOTOGRAPHER">Photographer</option>
          <option value="SUPERVISOR">Supervisor</option>
          <option value="OPERATIONS_MANAGER">Operations Manager</option>
          <option value="SALES_STAFF">Sales</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="CEO">CEO</option>
          <option value="ACADEMY_TRAINEE">Academy Trainee</option>
        </select>
        <select className={`${inputCls} max-w-xs`} value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="rating">Sort: Rating</option>
          <option value="sales">Sort: Sales</option>
          <option value="uploads">Sort: Uploads</option>
          <option value="rate">Sort: Conversion</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg flex items-center gap-2">
            <Users className="h-4 w-4 text-navy-500" /> Performance Leaderboard
          </h2>
        </div>
        {sorted.length === 0 ? (
          <div className="p-16 text-center text-navy-400 text-sm">No staff found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Level/XP</th>
                  <th className="px-6 py-3">Uploaded</th>
                  <th className="px-6 py-3">Sold</th>
                  <th className="px-6 py-3">Rate</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/70">
                {sorted.map((u) => (
                  <tr key={u.id} className="hover:bg-cream-100/60">
                    <td className="px-6 py-3 font-medium">
                      <Link href={`/admin/staff/${u.id}`} className="text-brand-700 hover:underline">{u.name}</Link>
                      {u.isRepeater && (
                        <span className="ml-2 bg-gold-100 text-gold-700 text-xs px-2 py-0.5 rounded">+{u.repeaterYears}y</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-navy-600">{u.role}</td>
                    <td className="px-6 py-3 text-navy-600">{u.location?.name || "—"}</td>
                    <td className="px-6 py-3 text-navy-600">L{u.level ?? 1} ({u.xp ?? 0})</td>
                    <td className="px-6 py-3 text-navy-600">{u.uploaded}</td>
                    <td className="px-6 py-3 text-navy-600">{u.sold}</td>
                    <td className="px-6 py-3 font-semibold text-navy-900">{(u.rate * 100).toFixed(0)}%</td>
                    <td className="px-6 py-3 text-navy-600">{u.rating?.toFixed(1) ?? "—"}</td>
                    <td className="px-6 py-3 text-navy-600">€{u.totalCost.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Staff Member" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" required>
              <input name="name" required className={inputCls} />
            </Field>
            <Field label="Email" required>
              <input name="email" type="email" required className={inputCls} />
            </Field>
            <Field label="Phone / WhatsApp">
              <input name="phone" className={inputCls} />
            </Field>
            <Field label="Temporary password" required hint="Min 8 chars. Staff should change on first login.">
              <input name="password" type="text" required minLength={8} className={inputCls} />
            </Field>
            <Field label="Role" required>
              <select name="role" required className={inputCls}>
                <option value="PHOTOGRAPHER">Photographer</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="OPERATIONS_MANAGER">Operations Manager</option>
                <option value="SALES_STAFF">Sales Staff</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="ACADEMY_TRAINEE">Academy Trainee</option>
              </select>
            </Field>
            <Field label="Assigned Location">
              <select name="locationId" className={inputCls}>
                <option value="">Unassigned</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Base Salary (€/month)">
              <input name="salary" type="number" step="0.01" className={inputCls} />
            </Field>
            <Field label="Kiosk PIN (4-8 digits)">
              <input name="pin" pattern="\d{4,8}" className={inputCls} placeholder="e.g. 1234" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg text-sm text-navy-600 hover:bg-cream-100 min-h-[44px]">
              Cancel
            </button>
            <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 disabled:opacity-50 min-h-[44px]">
              {submitting ? "Creating…" : "Create Staff"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
