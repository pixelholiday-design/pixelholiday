import { prisma } from "@/lib/db";
import { Wifi, Camera as CamIcon, Monitor } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WifiTransferPage() {
  const cameras = await prisma.camera.findMany({ include: { location: true }, orderBy: { createdAt: "desc" } });
  const kiosks = await prisma.kioskDevice.findMany({ include: { location: true }, orderBy: { createdAt: "desc" } });

  // Group by location
  const byLocation = new Map<string, { name: string; cams: typeof cameras; kiosks: typeof kiosks }>();
  for (const c of cameras) {
    const k = c.locationId;
    if (!byLocation.has(k)) byLocation.set(k, { name: c.location.name, cams: [], kiosks: [] });
    byLocation.get(k)!.cams.push(c);
  }
  for (const k of kiosks) {
    const id = k.locationId;
    if (!byLocation.has(id)) byLocation.set(id, { name: k.location.name, cams: [], kiosks: [] });
    byLocation.get(id)!.kiosks.push(k);
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Hardware</div>
        <h1 className="heading text-4xl mt-1">Wi-Fi transmitter routing</h1>
        <p className="text-navy-400 mt-1">
          Photos from each camera flow directly to the cloud and appear on every kiosk at the same location.
          POST <code className="font-mono">/api/camera/capture</code> to deliver new frames.
        </p>
      </header>

      {Array.from(byLocation.entries()).map(([id, group]) => (
        <div key={id} className="card p-6">
          <h2 className="heading text-xl mb-4">{group.name}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="label-xs flex items-center gap-1 mb-3">
                <CamIcon className="h-3 w-3" /> Cameras
              </div>
              {group.cams.length === 0 ? (
                <div className="text-sm text-navy-400">None.</div>
              ) : (
                <ul className="space-y-2">
                  {group.cams.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 rounded-xl bg-cream-100/70 px-3 py-2">
                      <Wifi className="h-3.5 w-3.5 text-coral-500" />
                      <span className="font-medium text-navy-900">{c.name}</span>
                      <span className="text-xs text-navy-400 font-mono">{c.externalId}</span>
                      <span className="ml-auto text-xs text-navy-500">{c.captureCount} captures</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="label-xs flex items-center gap-1 mb-3">
                <Monitor className="h-3 w-3" /> Kiosks (auto-receive)
              </div>
              {group.kiosks.length === 0 ? (
                <div className="text-sm text-navy-400">None.</div>
              ) : (
                <ul className="space-y-2">
                  {group.kiosks.map((k) => (
                    <li key={k.id} className="flex items-center gap-3 rounded-xl bg-cream-100/70 px-3 py-2">
                      <span className="font-medium text-navy-900">{k.name}</span>
                      <span className="text-xs text-navy-400 font-mono">{k.externalId}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
