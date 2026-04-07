"use client";
import { useEffect, useState } from "react";
import { Home, Loader2 } from "lucide-react";

export default function HousingPage() {
  const [housing, setHousing] = useState<any[] | null>(null);
  useEffect(() => {
    fetch("/api/admin/housing")
      .then((r) => r.json())
      .then((d) => setHousing(d.housing || []))
      .catch(() => setHousing([]));
  }, []);
  const total = (housing || []).reduce((s, h) => s + h.monthlyCost, 0);

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Team</div>
        <h1 className="heading text-4xl mt-1">Staff Housing</h1>
        <p className="text-navy-400 mt-1">Apartments, monthly cost, and documentation per staff member.</p>
      </header>

      <div className="card p-6 inline-flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-coral-500/10 text-coral-600 flex items-center justify-center">
          <Home className="h-5 w-5" />
        </div>
        <div>
          <div className="label-xs">Total monthly cost</div>
          <div className="font-display text-3xl text-navy-900">€{total.toLocaleString()}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {housing === null ? (
          <div className="p-12 text-center text-navy-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : housing.length === 0 ? (
          <div className="p-16 text-center">
            <Home className="h-8 w-8 text-coral-500 mx-auto mb-2" />
            <div className="font-display text-xl text-navy-900">No housing records</div>
            <div className="text-sm text-navy-400 mt-1">Assign apartments to seasonal staff to track here.</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Staff</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3">Monthly</th>
                <th className="px-6 py-3">Docs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {housing.map((h) => (
                <tr key={h.id} className="hover:bg-cream-100/60">
                  <td className="px-6 py-3 font-medium text-navy-900">{h.user?.name}</td>
                  <td className="px-6 py-3 text-navy-600">{h.address}</td>
                  <td className="px-6 py-3 text-navy-600">€{h.monthlyCost}</td>
                  <td className="px-6 py-3">
                    {h.documentation ? (
                      <a href={h.documentation} className="text-coral-600 hover:underline">View</a>
                    ) : (
                      <span className="text-navy-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
