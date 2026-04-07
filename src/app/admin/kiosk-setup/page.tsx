import { prisma } from "@/lib/db";
import { Wifi, Cloud, Server, Monitor, QrCode } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KioskSetupAdmin() {
  const [kiosks, syncStats] = await Promise.all([
    prisma.kioskConfig.findMany({ orderBy: { createdAt: "desc" } }),
    Promise.all([
      prisma.syncLog.count({ where: { status: "PENDING" } }),
      prisma.syncLog.count({ where: { status: "SYNCED" } }),
      prisma.syncLog.count({ where: { status: "FAILED" } }),
    ]),
  ]);
  const [pending, synced, failed] = syncStats;

  // Group by location and pull out the local server
  type Group = { locationId: string; localServer: any | null; clients: any[] };
  const map = new Map<string, Group>();
  for (const k of kiosks) {
    const g = map.get(k.locationId) || { locationId: k.locationId, localServer: null, clients: [] };
    if (k.isLocalServer) g.localServer = k;
    else g.clients.push(k);
    map.set(k.locationId, g);
  }
  const groups = Array.from(map.values());

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Hardware</div>
        <h1 className="heading text-4xl mt-1">Kiosk setup &amp; network</h1>
        <p className="text-navy-400 mt-1">
          Configure which kiosks connect to which sale point on the local Wi-Fi, and monitor cloud sync status.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Stat label="Registered devices" value={`${kiosks.length}`} icon={<Monitor />} />
        <Stat label="Pending sync" value={`${pending}`} icon={<Cloud />} accent={pending > 0 ? "coral" : "green"} />
        <Stat label="Synced rows" value={`${synced}`} icon={<Cloud />} accent="green" sub={failed > 0 ? `${failed} failed` : ""} />
      </div>

      {groups.length === 0 ? (
        <div className="card p-16 text-center">
          <Server className="h-8 w-8 text-coral-500 mx-auto mb-3" />
          <div className="font-display text-xl text-navy-900">No kiosks registered yet</div>
          <div className="text-sm text-navy-400 mt-1">
            Open <code>/kiosk/setup</code> on the device, enter staff PIN, and configure it.
          </div>
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.locationId} className="card p-6">
            <h2 className="heading text-xl mb-4">Location {g.locationId.slice(0, 8)}…</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="label-xs flex items-center gap-1 mb-3">
                  <Server className="h-3 w-3" /> Local server
                </div>
                {g.localServer ? (
                  <div className="rounded-xl bg-coral-500/10 border border-coral-500/30 p-4">
                    <div className="font-semibold text-navy-900">{g.localServer.name}</div>
                    <div className="text-xs font-mono text-navy-500">{g.localServer.serverIp || "auto"}</div>
                    <div className="text-xs text-navy-500 mt-1">{g.localServer.type}</div>
                  </div>
                ) : (
                  <div className="text-sm text-navy-400">No local server registered.</div>
                )}
              </div>
              <div>
                <div className="label-xs flex items-center gap-1 mb-3">
                  <Wifi className="h-3 w-3" /> Connected gallery kiosks
                </div>
                {g.clients.length === 0 ? (
                  <div className="text-sm text-navy-400">None.</div>
                ) : (
                  <ul className="space-y-2">
                    {g.clients.map((c) => (
                      <li key={c.id} className="rounded-xl bg-cream-100 px-3 py-2 flex items-center gap-3">
                        <Monitor className="h-3.5 w-3.5 text-coral-500" />
                        <span className="font-medium text-navy-900">{c.name}</span>
                        <span className="text-xs text-navy-500 font-mono">{c.type}</span>
                        <span className="ml-auto text-xs text-navy-400">{c.networkMode}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      <div className="card p-6">
        <h2 className="heading text-lg mb-3 flex items-center gap-2">
          <QrCode className="h-4 w-4 text-coral-500" /> Install kiosk app on a device
        </h2>
        <p className="text-sm text-navy-500 mb-4">
          Open this URL on the iPad / TV / tablet, then "Add to Home Screen" — the device will install
          the kiosk PWA in fullscreen landscape mode.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 rounded-xl bg-cream-100 p-4">
            <div className="label-xs mb-1">Sale Point app</div>
            <code className="text-sm break-all">/kiosk/setup → choose "Sale point"</code>
          </div>
          <div className="flex-1 rounded-xl bg-cream-100 p-4">
            <div className="label-xs mb-1">Gallery display app</div>
            <code className="text-sm break-all">/kiosk/setup → choose "Gallery display"</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, accent, sub }: any) {
  const tint =
    accent === "coral" ? "bg-coral-500/10 text-coral-600" :
    accent === "green" ? "bg-green-500/10 text-green-600" :
    "bg-navy-800/10 text-navy-700";
  return (
    <div className="stat-card">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
      <div className="label-xs mt-3">{label}</div>
      <div className="font-display text-3xl text-navy-900">{value}</div>
      {sub && <div className="text-xs text-coral-600 mt-1">{sub}</div>}
    </div>
  );
}
