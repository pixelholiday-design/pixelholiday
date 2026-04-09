"use client";
import { useEffect, useMemo, useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import {
  Calendar as CalendarIcon,
  List as ListIcon,
  Plus,
  X,
  Globe,
  AtSign,
  ThumbsUp,
  Mail,
  Phone,
  MessageCircle,
  Building2,
  UserPlus,
  Users,
  MapPin,
  Clock,
  Check,
  XCircle,
  AlertTriangle,
  CircleCheck,
  Loader2,
  Code2,
  Copy,
  ExternalLink,
} from "lucide-react";

type Appt = {
  id: string;
  scheduledTime: string;
  status: string;
  source: string;
  sourceDetail?: string | null;
  externalRef?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  partySize?: number;
  sessionType?: string;
  estimatedDuration?: number;
  specialRequests?: string | null;
  notes?: string | null;
  locationId?: string | null;
  location?: { id: string; name: string; locationType?: string | null } | null;
  assignedPhotographer?: { id: string; name: string } | null;
  gallery?: { id: string; magicLinkToken?: string | null; location?: { name?: string } | null; customer?: { name?: string | null; whatsapp?: string | null } | null } | null;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-brand-50 text-brand-700 border-brand-200",
  IN_PROGRESS: "bg-brand-100 text-brand-800 border-brand-300",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  NO_SHOW: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
};

function sourceIcon(source: string) {
  const Icon =
    source === "WEBSITE" ? Globe :
    source === "INSTAGRAM" ? AtSign :
    source === "FACEBOOK" ? ThumbsUp :
    source === "EMAIL" ? Mail :
    source === "PHONE" ? Phone :
    source === "WHATSAPP" ? MessageCircle :
    source === "HOTEL_CONCIERGE" ? Building2 :
    source === "PARTNER_REFERRAL" ? Users :
    source === "WALK_IN" ? UserPlus :
    source === "QR_CODE" ? MapPin :
    Globe;
  return <Icon className="h-3 w-3" strokeWidth={1.5} />;
}

const SOURCES = [
  "WALK_IN", "WEBSITE", "INSTAGRAM", "FACEBOOK", "EMAIL", "PHONE", "WHATSAPP",
  "HOTEL_CONCIERGE", "PARTNER_REFERRAL", "HOOK_GALLERY", "QR_CODE", "VIP_BOOKING", "PRE_ARRIVAL",
];
const SESSION_TYPES = ["STANDARD", "SUNSET", "VIP", "FAMILY", "ROMANTIC", "GROUP"];
const STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "NO_SHOW", "CANCELLED"];

export default function BookingsPage() {
  const [appts, setAppts] = useState<Appt[]>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string; locationType: string | null }>>([]);
  const [photographers, setPhotographers] = useState<Array<{ id: string; name: string; locationId: string | null }>>([]);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [filter, setFilter] = useState({ source: "", status: "", locationId: "", photographerId: "" });
  const [selected, setSelected] = useState<Appt | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedEmbed, setCopiedEmbed] = useState<"iframe" | "link" | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/bookings").then((r) => r.json());
    setAppts(r.appointments || []);
    setLocations(r.locations || []);
    setPhotographers(r.photographers || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => appts.filter((a) => {
    if (filter.source && a.source !== filter.source) return false;
    if (filter.status && a.status !== filter.status) return false;
    if (filter.locationId && a.locationId !== filter.locationId && a.gallery?.location?.name !== locations.find(l => l.id === filter.locationId)?.name) return false;
    if (filter.photographerId && a.assignedPhotographer?.id !== filter.photographerId) return false;
    return true;
  }), [appts, filter, locations]);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const week = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
    if (selected?.id === id) {
      const fresh = appts.find((a) => a.id === id);
      setSelected(fresh ? { ...fresh, status } : null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Operations</div>
          <h1 className="heading text-4xl mt-1">Bookings</h1>
          <p className="text-navy-400 mt-1 text-sm">
            All appointments from every source — website, Instagram, concierge, walk-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-white shadow-card border border-cream-300/60 p-1 text-sm">
            <button
              onClick={() => setView("calendar")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                view === "calendar" ? "bg-brand-400 text-white" : "text-navy-500 hover:bg-cream-100"
              }`}
            >
              <CalendarIcon className="h-4 w-4" strokeWidth={1.5} /> Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                view === "list" ? "bg-brand-400 text-white" : "text-navy-500 hover:bg-cream-100"
              }`}
            >
              <ListIcon className="h-4 w-4" strokeWidth={1.5} /> List
            </button>
          </div>
          <button onClick={() => setEmbedOpen((o) => !o)} className="btn-secondary">
            <Code2 className="h-4 w-4" strokeWidth={1.5} /> Embed Widget
          </button>
          <button onClick={() => setNewOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" strokeWidth={1.5} /> New Booking
          </button>
        </div>
      </header>

      {/* Embed Widget Panel */}
      {embedOpen && (
        <EmbedPanel
          locations={locations}
          onClose={() => setEmbedOpen(false)}
          copiedEmbed={copiedEmbed}
          setCopiedEmbed={setCopiedEmbed}
        />
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3 text-sm">
        <select className="input !w-auto" value={filter.source} onChange={(e) => setFilter({ ...filter, source: e.target.value })}>
          <option value="">All sources</option>
          {SOURCES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input !w-auto" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input !w-auto" value={filter.locationId} onChange={(e) => setFilter({ ...filter, locationId: e.target.value })}>
          <option value="">All locations</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select className="input !w-auto" value={filter.photographerId} onChange={(e) => setFilter({ ...filter, photographerId: e.target.value })}>
          <option value="">All photographers</option>
          {photographers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="text-xs text-navy-400 ml-auto">{filtered.length} shown · {appts.length} total</div>
      </div>

      {loading ? (
        <div className="card p-16 text-center text-navy-400"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
      ) : view === "calendar" ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {week.map((d) => {
            const day = filtered.filter((a) => isSameDay(new Date(a.scheduledTime), d));
            return (
              <div key={d.toISOString()} className="card p-3 min-h-[260px]">
                <div className="font-medium text-sm text-navy-900 border-b border-cream-300/70 pb-2 mb-2">
                  {format(d, "EEE")}
                  <div className="text-xs text-navy-400">{format(d, "d MMM")}</div>
                </div>
                <div className="space-y-1.5">
                  {day.length === 0 && <div className="text-[11px] text-navy-300 italic">—</div>}
                  {day.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelected(a)}
                      className={`w-full text-left rounded-lg border px-2 py-1.5 text-[11px] transition hover:shadow-card ${STATUS_COLORS[a.status] || STATUS_COLORS.PENDING}`}
                    >
                      <div className="font-medium text-navy-900 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" strokeWidth={1.5} />
                        {format(new Date(a.scheduledTime), "HH:mm")}
                      </div>
                      <div className="truncate text-navy-700 font-medium">
                        {a.customerName || a.gallery?.customer?.name || "—"}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] opacity-80 mt-0.5">
                        {sourceIcon(a.source)}
                        <span className="truncate">{a.sessionType || "STD"}</span>
                        {(a.partySize || 0) > 1 && <span>· {a.partySize}p</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">When</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Photographer</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Party</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-navy-400">No bookings match your filters.</td></tr>
              )}
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="hover:bg-cream-100/60 cursor-pointer"
                >
                  <td className="px-6 py-3 text-navy-900">{format(new Date(a.scheduledTime), "dd MMM HH:mm")}</td>
                  <td className="px-6 py-3 font-medium text-navy-900">{a.customerName || a.gallery?.customer?.name || "—"}</td>
                  <td className="px-6 py-3 text-navy-500">{a.location?.name || a.gallery?.location?.name || "—"}</td>
                  <td className="px-6 py-3 text-navy-500">{a.assignedPhotographer?.name || "—"}</td>
                  <td className="px-6 py-3 text-navy-500">{a.sessionType || "STANDARD"}</td>
                  <td className="px-6 py-3 text-navy-500">{a.partySize || 1}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cream-200 text-navy-700">
                      {sourceIcon(a.source)} {a.source}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_COLORS[a.status] || STATUS_COLORS.PENDING}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div
          className="fixed inset-0 bg-navy-900/30 backdrop-blur-sm z-40 flex justify-end"
          onClick={() => setSelected(null)}
        >
          <aside
            className="w-full max-w-md bg-white h-full overflow-y-auto shadow-lift animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-cream-300/70">
              <div>
                <div className="label-xs">Booking</div>
                <h2 className="heading text-xl">{selected.customerName || selected.gallery?.customer?.name || "—"}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost !p-2">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <Row label="When" value={format(new Date(selected.scheduledTime), "EEE d MMM yyyy · HH:mm")} />
              <Row label="Duration" value={`${selected.estimatedDuration || 30} min`} />
              <Row label="Session type" value={selected.sessionType || "STANDARD"} />
              <Row label="Party size" value={String(selected.partySize || 1)} />
              <Row label="Location" value={selected.location?.name || selected.gallery?.location?.name || "—"} />
              <Row label="Photographer" value={selected.assignedPhotographer?.name || "—"} />
              <div className="border-t border-cream-300/70 pt-3">
                <Row label="Email" value={selected.customerEmail || selected.gallery?.customer?.whatsapp || "—"} />
                <Row label="Phone" value={selected.customerPhone || "—"} />
              </div>
              <div className="border-t border-cream-300/70 pt-3">
                <Row
                  label="Source"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      {sourceIcon(selected.source)}
                      {selected.source}
                    </span>
                  }
                />
                {selected.sourceDetail && <Row label="Source detail" value={selected.sourceDetail} />}
                {selected.externalRef && <Row label="External ref" value={selected.externalRef} />}
              </div>
              {selected.specialRequests && (
                <div className="border-t border-cream-300/70 pt-3">
                  <div className="label-xs mb-1.5">Special requests</div>
                  <div className="text-navy-700">{selected.specialRequests}</div>
                </div>
              )}

              {/* Status action buttons */}
              <div className="border-t border-cream-300/70 pt-4">
                <div className="label-xs mb-2">Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <StatusBtn onClick={() => updateStatus(selected.id, "CONFIRMED")} icon={<Check className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Confirm" color="brand" />
                  <StatusBtn onClick={() => updateStatus(selected.id, "COMPLETED")} icon={<CircleCheck className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Complete" color="green" />
                  <StatusBtn onClick={() => updateStatus(selected.id, "NO_SHOW")} icon={<AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />} label="No-show" color="amber" />
                  <StatusBtn onClick={() => updateStatus(selected.id, "CANCELLED")} icon={<XCircle className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Cancel" color="gray" />
                </div>
                <div className="text-[11px] text-navy-400 mt-2 text-center">Current: {selected.status}</div>
              </div>

              {selected.gallery?.magicLinkToken && (
                <div className="border-t border-cream-300/70 pt-3">
                  <a href={`/gallery/${selected.gallery.magicLinkToken}`} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-700 text-sm">
                    View customer gallery →
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* New Booking modal */}
      {newOpen && <NewBookingModal locations={locations} onClose={() => setNewOpen(false)} onCreated={load} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <div className="label-xs pt-0.5">{label}</div>
      <div className="text-navy-900 text-right">{value}</div>
    </div>
  );
}

function StatusBtn({ onClick, icon, label, color }: { onClick: () => void; icon: React.ReactNode; label: string; color: string }) {
  const cls =
    color === "brand" ? "bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100" :
    color === "green" ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" :
    color === "amber" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" :
    "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
  return (
    <button onClick={onClick} className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${cls}`}>
      {icon} {label}
    </button>
  );
}

function NewBookingModal({
  locations,
  onClose,
  onCreated,
}: {
  locations: Array<{ id: string; name: string }>;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    source: "WEBSITE",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    sessionType: "STANDARD",
    preferredDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    preferredTime: "17:00",
    partySize: 2,
    locationName: locations[0]?.name || "",
    sourceDetail: "",
    specialRequests: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/bookings/external", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then((r) => r.json());
    setBusy(false);
    if (res?.ok) {
      onCreated();
      onClose();
    } else {
      setErr(res?.error || "Failed to create booking");
    }
  }

  return (
    <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading text-2xl">New booking</h2>
          <button onClick={onClose} className="btn-ghost !p-2"><X className="h-4 w-4" strokeWidth={1.5} /></button>
        </div>

        <div className="space-y-3">
          <Field label="Source">
            <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Source detail (optional)">
            <input className="input" placeholder="e.g. IG DM from @handle" value={form.sourceDetail} onChange={(e) => setForm({ ...form, sourceDetail: e.target.value })} />
          </Field>
          <Field label="Customer name">
            <input className="input" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input type="email" className="input" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className="input" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
            </Field>
          </div>
          <Field label="Location">
            <select className="input" value={form.locationName} onChange={(e) => setForm({ ...form, locationName: e.target.value })}>
              {locations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>
          </Field>
          <Field label="Session type">
            <select className="input" value={form.sessionType} onChange={(e) => setForm({ ...form, sessionType: e.target.value })}>
              {SESSION_TYPES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Date">
              <input type="date" className="input" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
            </Field>
            <Field label="Time">
              <input type="time" className="input" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} />
            </Field>
            <Field label="Party size">
              <input type="number" min={1} max={50} className="input" value={form.partySize} onChange={(e) => setForm({ ...form, partySize: parseInt(e.target.value) || 1 })} />
            </Field>
          </div>
          <Field label="Special requests">
            <textarea className="input min-h-[60px]" value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} />
          </Field>

          {err && <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-2 text-sm text-coral-700">{err}</div>}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submit} disabled={busy || !form.customerName} className="btn-primary flex-1">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" strokeWidth={1.5} />}
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="label-xs mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function EmbedPanel({
  locations,
  onClose,
  copiedEmbed,
  setCopiedEmbed,
}: {
  locations: Array<{ id: string; name: string }>;
  onClose: () => void;
  copiedEmbed: "iframe" | "link" | null;
  setCopiedEmbed: (v: "iframe" | "link" | null) => void;
}) {
  const [selectedLocation, setSelectedLocation] = useState(locations[0]?.id || "");
  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://yoursite.com";
  const bookUrl = selectedLocation
    ? `${appUrl}/book?location=${selectedLocation}`
    : `${appUrl}/book`;
  const iframeCode = `<iframe\n  src="${bookUrl}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border-radius: 12px; border: 1px solid #E9E7DD;"\n  title="Fotiqo Booking"\n></iframe>`;

  async function copy(type: "iframe" | "link") {
    await navigator.clipboard.writeText(type === "iframe" ? iframeCode : bookUrl);
    setCopiedEmbed(type);
    setTimeout(() => setCopiedEmbed(null), 2000);
  }

  return (
    <div className="card p-6 border-l-4 border-brand-400 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-lg flex items-center gap-2">
            <Code2 className="h-4 w-4 text-brand-500" strokeWidth={1.5} />
            Embed Booking Widget
          </h2>
          <p className="text-xs text-navy-400 mt-0.5">
            Add the booking widget to your hotel website or landing page.
          </p>
        </div>
        <button onClick={onClose} className="btn-ghost !p-2">
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      {locations.length > 0 && (
        <label className="block">
          <div className="label-xs mb-1.5">Location</div>
          <select
            className="input !w-auto"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>
      )}

      {/* Direct link */}
      <div>
        <div className="label-xs mb-1.5">Direct booking URL</div>
        <div className="flex items-center gap-2">
          <code className="flex-1 block bg-cream-100 rounded-xl px-4 py-2.5 text-xs font-mono text-navy-700 break-all">
            {bookUrl}
          </code>
          <button onClick={() => copy("link")} className="btn-secondary shrink-0 text-xs !px-3 !py-2">
            {copiedEmbed === "link" ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <a href={bookUrl} target="_blank" rel="noreferrer" className="btn-ghost !p-2 shrink-0">
            <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>

      {/* Iframe embed */}
      <div>
        <div className="label-xs mb-1.5">iframe embed code</div>
        <div className="relative">
          <pre className="bg-navy-900 text-green-300 text-xs font-mono rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-all">
            {iframeCode}
          </pre>
          <button
            onClick={() => copy("iframe")}
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
          >
            {copiedEmbed === "iframe" ? (
              <><Check className="h-3 w-3 text-green-400" /> Copied!</>
            ) : (
              <><Copy className="h-3 w-3" /> Copy</>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-navy-400">
        Paste the iframe code into your website's HTML where you want the booking form to appear.
        Guests can select a time slot and photographer directly from your site.
      </p>
    </div>
  );
}
