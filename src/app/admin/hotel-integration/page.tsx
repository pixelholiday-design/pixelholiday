"use client";
import { useEffect, useState } from "react";
import { Building2, Copy, Check, ToggleLeft, ToggleRight, Loader2, Info } from "lucide-react";

type HotelLocation = {
  id: string;
  name: string;
  type: string;
  autoOfferEnabled?: boolean;
  _count?: { customers: number };
};

type CheckInEvent = {
  id: string;
  name: string | null;
  roomNumber: string | null;
  whatsapp: string | null;
  createdAt: string;
  location?: { name: string } | null;
};

type DigitalPassStats = {
  total: number;
  basic: number;
  unlimited: number;
  vip: number;
};

export default function HotelIntegrationPage() {
  const [locations, setLocations] = useState<HotelLocation[]>([]);
  const [events, setEvents] = useState<CheckInEvent[]>([]);
  const [passStats, setPassStats] = useState<DigitalPassStats>({ total: 0, basic: 0, unlimited: 0, vip: 0 });
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const appUrl = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "https://yoursite.com";

  async function load() {
    setLoading(true);
    try {
      const [locRes, custRes] = await Promise.all([
        fetch("/api/admin/locations").then((r) => r.json()).catch(() => ({ locations: [] })),
        fetch("/api/admin/customers?limit=20").then((r) => r.json()).catch(() => ({ customers: [] })),
      ]);
      const hotelLocs: HotelLocation[] = (locRes.locations || []).filter(
        (l: any) => l.type === "HOTEL"
      );
      setLocations(hotelLocs);

      const customers: CheckInEvent[] = (custRes.customers || []);
      setEvents(customers.slice(0, 10));

      // Digital pass stats from customers
      const all: any[] = custRes.customers || [];
      const withPass = all.filter((c: any) => c.hasDigitalPass);
      setPassStats({
        total: withPass.length,
        basic: withPass.filter((c: any) => c.digitalPassType === "BASIC").length,
        unlimited: withPass.filter((c: any) => c.digitalPassType === "UNLIMITED").length,
        vip: withPass.filter((c: any) => c.digitalPassType === "VIP").length,
      });
    } catch {
      // silently degrade
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function webhookUrl(locationId: string) {
    return `${appUrl}/api/hotel/checkin`;
  }

  async function copyWebhook(locationId: string) {
    await navigator.clipboard.writeText(webhookUrl(locationId));
    setCopiedId(locationId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function toggleAutoOffer(loc: HotelLocation) {
    setTogglingId(loc.id);
    // Optimistic update — persist via locations PATCH when that endpoint exists
    setLocations((prev) =>
      prev.map((l) =>
        l.id === loc.id ? { ...l, autoOfferEnabled: !l.autoOfferEnabled } : l
      )
    );
    // Fire-and-forget to locations update endpoint (no-op if not implemented yet)
    await fetch(`/api/admin/locations/${loc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoOfferEnabled: !loc.autoOfferEnabled }),
    }).catch(() => {});
    setTogglingId(null);
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Module 11</div>
        <h1 className="heading text-4xl mt-1">Hotel Integration</h1>
        <p className="text-navy-400 mt-1 text-sm">
          PMS webhook setup, check-in events, and Digital Pass sales.
        </p>
      </header>

      {loading ? (
        <div className="card p-16 text-center text-navy-400">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Digital Pass Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Passes Sold", value: passStats.total, color: "bg-brand-50 text-brand-700" },
              { label: "Basic", value: passStats.basic, color: "bg-cream-100 text-navy-700" },
              { label: "Unlimited", value: passStats.unlimited, color: "bg-gold-50 text-gold-700" },
              { label: "VIP", value: passStats.vip, color: "bg-coral-50 text-coral-700" },
            ].map((stat) => (
              <div key={stat.label} className={`card p-5 ${stat.color}`}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs font-medium mt-1 opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Setup Guide */}
          <div className="card p-6 border-l-4 border-brand-400">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-brand-500 mt-0.5 shrink-0" />
              <div>
                <h2 className="heading text-lg mb-3">PMS Webhook Setup Guide</h2>
                <ol className="space-y-2 text-sm text-navy-700 list-decimal list-inside">
                  <li>
                    In your hotel PMS (Opera, Cloudbeds, Mews, etc.), navigate to
                    <strong> Integrations → Webhooks</strong>.
                  </li>
                  <li>
                    Add a new webhook triggered on <strong>Check-In</strong> events.
                  </li>
                  <li>
                    Set the endpoint URL to the webhook URL shown for your location below.
                  </li>
                  <li>
                    Configure the payload to include:
                    <code className="ml-1 bg-cream-200 px-1.5 py-0.5 rounded text-xs font-mono">
                      guestName, roomNumber, phone, email, checkInDate, checkOutDate, hotelLocationId
                    </code>
                  </li>
                  <li>
                    Set <strong>Content-Type</strong> to <code className="bg-cream-200 px-1.5 py-0.5 rounded text-xs font-mono">application/json</code>.
                  </li>
                  <li>
                    Save and test — a welcome WhatsApp is sent to the guest automatically.
                  </li>
                </ol>
                <div className="mt-4 p-3 bg-cream-100 rounded-xl text-xs font-mono text-navy-700 break-all">
                  POST {appUrl}/api/hotel/checkin
                </div>
              </div>
            </div>
          </div>

          {/* Connected Hotel Locations */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-300/70 flex items-center justify-between">
              <h2 className="heading text-lg flex items-center gap-2">
                <Building2 className="h-4 w-4 text-navy-500" /> Connected Hotels
              </h2>
              <span className="text-xs text-navy-400">{locations.length} hotel location{locations.length !== 1 ? "s" : ""}</span>
            </div>
            {locations.length === 0 ? (
              <div className="p-12 text-center text-navy-400 text-sm">
                No hotel locations found. Add a location with type <strong>HOTEL</strong> first.
              </div>
            ) : (
              <div className="divide-y divide-cream-300/70">
                {locations.map((loc) => (
                  <div key={loc.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-navy-900">{loc.name}</div>
                      <div className="text-xs text-navy-400 mt-0.5 font-mono break-all">
                        {webhookUrl(loc.id)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyWebhook(loc.id)}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-cream-300 bg-white hover:bg-cream-50 text-navy-700 transition"
                      >
                        {copiedId === loc.id ? (
                          <><Check className="h-3.5 w-3.5 text-green-600" /> Copied</>
                        ) : (
                          <><Copy className="h-3.5 w-3.5" /> Copy URL</>
                        )}
                      </button>
                      <button
                        onClick={() => toggleAutoOffer(loc)}
                        disabled={togglingId === loc.id}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
                          loc.autoOfferEnabled
                            ? "border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100"
                            : "border-cream-300 bg-white text-navy-500 hover:bg-cream-50"
                        }`}
                        title="Toggle auto-offer of Digital Pass on check-in"
                      >
                        {loc.autoOfferEnabled
                          ? <ToggleRight className="h-4 w-4" />
                          : <ToggleLeft className="h-4 w-4" />}
                        Auto-offer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Check-In Events */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-300/70">
              <h2 className="heading text-lg">Recent Check-In Events</h2>
              <p className="text-xs text-navy-400 mt-0.5">Latest guests registered via webhook or manual entry</p>
            </div>
            {events.length === 0 ? (
              <div className="p-12 text-center text-navy-400 text-sm">
                No check-in events yet. Configure the PMS webhook to start receiving guests.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                    <th className="px-6 py-3">Guest</th>
                    <th className="px-6 py-3">Room</th>
                    <th className="px-6 py-3">WhatsApp</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-300/70">
                  {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-cream-100/60">
                      <td className="px-6 py-3 font-medium text-navy-900">{ev.name || "—"}</td>
                      <td className="px-6 py-3 text-navy-600">{ev.roomNumber || "—"}</td>
                      <td className="px-6 py-3 text-navy-600">{ev.whatsapp || "—"}</td>
                      <td className="px-6 py-3 text-navy-600">{ev.location?.name || "—"}</td>
                      <td className="px-6 py-3 text-navy-400 text-xs">
                        {new Date(ev.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
