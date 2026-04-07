import { prisma } from "@/lib/db";
import { Monitor, Plus, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KiosksPage() {
  const kiosks = await prisma.kioskDevice.findMany({
    include: { location: true },
    orderBy: { createdAt: "desc" },
  });
  const locations = await prisma.location.findMany({ orderBy: { name: "asc" } });
  function isOnline(p: Date | null) {
    if (!p) return false;
    return Date.now() - p.getTime() < 5 * 60 * 1000;
  }
  const online = kiosks.filter((k) => isOnline(k.lastPingAt)).length;
  const todaySales = kiosks.reduce((s, k) => s + k.todaySalesCents, 0) / 100;

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Hardware</div>
          <h1 className="heading text-4xl mt-1">Kiosks</h1>
          <p className="text-navy-400 mt-1">Self-service touch screens and TV displays.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Stat label="Devices" value={`${kiosks.length}`} />
        <Stat label="Online" value={`${online}`} accent="green" />
        <Stat label="Sales today" value={`€${todaySales.toLocaleString()}`} />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Devices</h2>
        </div>
        {kiosks.length === 0 ? (
          <div className="p-16 text-center">
            <Monitor className="h-8 w-8 text-coral-500 mx-auto mb-3" />
            <div className="font-display text-xl text-navy-900">No kiosks yet</div>
            <div className="text-sm text-navy-400 mt-1">Register a device below.</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Device</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Last ping</th>
                <th className="px-6 py-3">Today</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {kiosks.map((k) => {
                const ok = isOnline(k.lastPingAt);
                return (
                  <tr key={k.id} className="hover:bg-cream-100/60">
                    <td className="px-6 py-3">
                      <div className="font-medium text-navy-900">{k.name}</div>
                      <div className="text-xs text-navy-400 font-mono">{k.externalId}</div>
                    </td>
                    <td className="px-6 py-3 text-navy-600">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {k.location?.name}
                    </td>
                    <td className="px-6 py-3 text-navy-500 text-xs">
                      {k.lastPingAt ? new Date(k.lastPingAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-3 font-semibold text-navy-900">
                      €{(k.todaySalesCents / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full text-xs font-medium px-2.5 py-1 ${
                          ok ? "bg-green-50 text-green-700" : "bg-coral-50 text-coral-700"
                        }`}
                      >
                        {ok ? "online" : "offline"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-6">
        <h2 className="heading text-lg mb-4">Register a kiosk</h2>
        <form action="/api/admin/kiosks/register" method="POST" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <div className="label-xs mb-1.5">External ID</div>
            <input className="input" name="externalId" placeholder="KIOSK-AQUA-01" required />
          </label>
          <label className="block">
            <div className="label-xs mb-1.5">Display name</div>
            <input className="input" name="name" placeholder="AquaSplash main lobby" required />
          </label>
          <label className="block md:col-span-2">
            <div className="label-xs mb-1.5">Location</div>
            <select className="input" name="locationId" required>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary">
              <Plus className="h-4 w-4" /> Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "green" }) {
  return (
    <div className="stat-card">
      <div className="label-xs">{label}</div>
      <div className={`font-display text-3xl ${accent === "green" ? "text-green-600" : "text-navy-900"}`}>{value}</div>
    </div>
  );
}
