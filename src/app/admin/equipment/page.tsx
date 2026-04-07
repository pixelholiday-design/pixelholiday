"use client";
import { useEffect, useState } from "react";

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/admin/equipment").then((r) => r.json()).then((d) => setEquipment(d.equipment || []));
  }, []);
  const total = equipment.reduce((s, e) => s + (e.purchaseCost || 0), 0);
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Equipment Tracking</h1>
      <div className="mb-4">Total cost: <strong>€{total.toFixed(2)}</strong></div>
      <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-gray-100"><tr><th className="text-left p-2">Name</th><th>Type</th><th>Cost</th><th>Status</th><th>Assigned To</th><th>Location</th></tr></thead>
        <tbody>
          {equipment.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="p-2">{e.name}</td>
              <td>{e.type}</td>
              <td>€{e.purchaseCost || 0}</td>
              <td>{e.status}</td>
              <td>{e.assignments?.[0]?.user?.name || "—"}</td>
              <td>{e.location?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
