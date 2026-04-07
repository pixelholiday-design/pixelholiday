import { prisma } from "@/lib/db";
import { Camera as CamIcon, MapPin, Activity, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CamerasPage() {
  const cameras = await prisma.camera.findMany({
    include: { location: true },
    orderBy: { createdAt: "desc" },
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  function isOnline(lastPingAt: Date | null) {
    if (!lastPingAt) return false;
    return Date.now() - lastPingAt.getTime() < 5 * 60 * 1000;
  }

  const online = cameras.filter((c) => isOnline(c.lastPingAt)).length;
  const totalCaptures = cameras.reduce((s, c) => s + c.captureCount, 0);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Hardware</div>
          <h1 className="heading text-4xl mt-1">Cameras</h1>
          <p className="text-navy-400 mt-1">Speed cameras, ride cams, and roaming devices.</p>
        </div>
        <a href="#register" className="btn-primary">
          <Plus className="h-4 w-4" /> Register camera
        </a>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Stat label="Registered" value={`${cameras.length}`} />
        <Stat label="Online now" value={`${online}`} accent="green" />
        <Stat label="Total captures" value={`${totalCaptures.toLocaleString()}`} />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Devices</h2>
        </div>
        {cameras.length === 0 ? (
          <div className="p-16 text-center">
            <CamIcon className="h-8 w-8 text-coral-500 mx-auto mb-3" />
            <div className="font-display text-xl text-navy-900">No cameras yet</div>
            <div className="text-sm text-navy-400 mt-1">
              Register your first speed cam below or POST to <code>/api/camera/register</code>.
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Camera</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Captures</th>
                <th className="px-6 py-3">Last ping</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {cameras.map((c) => {
                const ok = isOnline(c.lastPingAt);
                return (
                  <tr key={c.id} className="hover:bg-cream-100/60">
                    <td className="px-6 py-3">
                      <div className="font-medium text-navy-900">{c.name}</div>
                      <div className="text-xs text-navy-400 font-mono">{c.externalId}</div>
                    </td>
                    <td className="px-6 py-3 text-navy-600">{c.type}</td>
                    <td className="px-6 py-3 text-navy-600">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {c.location?.name}
                    </td>
                    <td className="px-6 py-3 font-semibold text-navy-900">{c.captureCount}</td>
                    <td className="px-6 py-3 text-navy-500 text-xs">
                      {c.lastPingAt ? new Date(c.lastPingAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-1 ${
                          ok ? "bg-green-50 text-green-700" : "bg-coral-50 text-coral-700"
                        }`}
                      >
                        <Activity className="h-3 w-3" /> {ok ? "online" : "offline"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <RegisterForm />
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

async function RegisterForm() {
  const locations = await prisma.location.findMany({ orderBy: { name: "asc" } });
  return (
    <div id="register" className="card p-6">
      <h2 className="heading text-lg mb-4">Register a new camera</h2>
      <form
        action="/api/camera/register"
        method="POST"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        encType="application/x-www-form-urlencoded"
      >
        <label className="block">
          <div className="label-xs mb-1.5">External ID</div>
          <input className="input" name="externalId" placeholder="NK-D7000-001" required />
        </label>
        <label className="block">
          <div className="label-xs mb-1.5">Display name</div>
          <input className="input" name="name" placeholder="AquaSplash Slide #1" required />
        </label>
        <label className="block">
          <div className="label-xs mb-1.5">Location</div>
          <select className="input" name="locationId" required>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <div className="label-xs mb-1.5">Type</div>
          <select className="input" name="type" required>
            <option value="SPEED_CAM">Speed cam</option>
            <option value="RIDE_CAM">Ride cam</option>
            <option value="ENTRANCE_CAM">Entrance cam</option>
            <option value="ROAMING">Roaming</option>
          </select>
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="btn-primary">
            Register camera
          </button>
        </div>
      </form>
    </div>
  );
}
