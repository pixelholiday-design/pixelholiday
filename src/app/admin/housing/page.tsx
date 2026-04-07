"use client";
import { useEffect, useState } from "react";

export default function HousingPage() {
  const [housing, setHousing] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/admin/housing").then((r) => r.json()).then((d) => setHousing(d.housing || []));
  }, []);
  const total = housing.reduce((s, h) => s + h.monthlyCost, 0);
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Staff Housing</h1>
      <div className="mb-4">Total monthly cost: <strong>€{total.toFixed(2)}</strong></div>
      <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-gray-100"><tr><th className="text-left p-2">Staff</th><th>Address</th><th>Monthly</th><th>Docs</th></tr></thead>
        <tbody>
          {housing.map((h) => (
            <tr key={h.id} className="border-t">
              <td className="p-2">{h.user?.name}</td>
              <td>{h.address}</td>
              <td>€{h.monthlyCost}</td>
              <td>{h.documentation ? <a href={h.documentation} className="text-blue-600">View</a> : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
