"use client";
import { useEffect, useState } from "react";
import { Package, Loader2 } from "lucide-react";

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<any[] | null>(null);
  useEffect(() => {
    fetch("/api/admin/equipment")
      .then((r) => r.json())
      .then((d) => setEquipment(d.equipment || []))
      .catch(() => setEquipment([]));
  }, []);

  const total = (equipment || []).reduce((s, e) => s + (e.purchaseCost || 0), 0);

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Operations</div>
        <h1 className="heading text-4xl mt-1">Equipment</h1>
        <p className="text-navy-400 mt-1">Cameras, lenses, kiosks — track ownership and total fleet cost.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Stat label="Total fleet cost" value={`€${total.toLocaleString()}`} />
        <Stat label="Items" value={`${equipment?.length ?? 0}`} />
        <Stat label="Assigned" value={`${(equipment || []).filter((e) => e.status === "ASSIGNED").length}`} />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70 flex items-center justify-between">
          <h2 className="heading text-lg">Inventory</h2>
        </div>
        {equipment === null ? (
          <div className="p-12 text-center text-navy-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : equipment.length === 0 ? (
          <Empty icon={<Package className="h-5 w-5" />} title="No equipment" sub="Add your first camera or lens to start tracking." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Cost</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Assigned to</th>
                  <th className="px-6 py-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/70">
                {equipment.map((e) => (
                  <tr key={e.id} className="hover:bg-cream-100/60">
                    <td className="px-6 py-3 font-medium text-navy-900">{e.name}</td>
                    <td className="px-6 py-3 text-navy-600">{e.type}</td>
                    <td className="px-6 py-3 text-navy-600">€{e.purchaseCost || 0}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full bg-coral-50 text-coral-700 text-xs font-medium px-2.5 py-1">
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-navy-600">{e.assignments?.[0]?.user?.name || "—"}</td>
                    <td className="px-6 py-3 text-navy-600">{e.location?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="label-xs">{label}</div>
      <div className="font-display text-3xl text-navy-900">{value}</div>
    </div>
  );
}

function Empty({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="p-16 text-center">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50 text-coral-600 mb-3">{icon}</div>
      <div className="font-display text-xl text-navy-900">{title}</div>
      <div className="text-sm text-navy-400 mt-1">{sub}</div>
    </div>
  );
}
