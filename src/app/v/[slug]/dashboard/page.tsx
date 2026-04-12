"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Users, Camera, DollarSign, Building, ArrowRight, Plus,
  X, Loader2, Hotel, Waves, FerrisWheel, Store, Settings, LogOut,
  Upload, ShoppingBag, Calendar, BarChart3, UserPlus, Briefcase, Sparkles,
  Network,
} from "lucide-react";

type Destination = {
  id: string;
  name: string;
  slug: string;
  venueType: string;
  address: string | null;
  city: string | null;
  country: string | null;
  currency: string;
  isActive: boolean;
};

type OrgInfo = {
  id: string;
  name: string;
  slug: string;
  brandName: string | null;
  brandPrimaryColor: string | null;
};

const VENUE_TYPES = [
  { value: "HOTEL", label: "Hotel", icon: Hotel },
  { value: "WATER_PARK", label: "Water Park", icon: Waves },
  { value: "ATTRACTION", label: "Attraction", icon: FerrisWheel },
  { value: "SELF_SERVICE", label: "Self-Service", icon: Store },
];

export default function CompanyDashboard() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [staffCount, setStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const primaryColor = org?.brandPrimaryColor || "#0EA5A5";
  const companyName = org?.brandName || org?.name || "Company";

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch(`/api/v/${slug}/dashboard`);
      if (!res.ok) { router.push(`/v/${slug}`); return; }
      const data = await res.json();
      setOrg(data.org);
      setDestinations(data.destinations || []);
      setStaffCount(data.staffCount || 0);
    } catch {
      router.push(`/v/${slug}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-navy-900">{companyName}</h1>
            <p className="text-sm text-navy-400">Company dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/v/${slug}/settings`} className="text-sm text-navy-400 hover:text-brand-500 flex items-center gap-1">
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <Link href={`/v/${slug}`} className="text-sm text-navy-400 hover:text-brand-500 flex items-center gap-1">
              <LogOut className="h-4 w-4" /> Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: MapPin, label: "Destinations", value: destinations.length },
            { icon: Users, label: "Staff", value: staffCount },
            { icon: Camera, label: "Galleries", value: 0 },
            { icon: DollarSign, label: "Revenue", value: "EUR 0" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card p-5">
                <Icon className="h-5 w-5 mb-2" style={{ color: primaryColor }} />
                <div className="font-display text-2xl text-navy-900">{s.value}</div>
                <div className="text-xs text-navy-400">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions for CEO */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90"
            style={{ background: primaryColor }}
          >
            <Plus className="h-4 w-4" /> Add Destination
          </button>
          <Link href={`/v/${slug}/team`} className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cream-300 bg-white text-sm text-navy-700 hover:border-brand-300 transition">
            <Network className="h-4 w-4" style={{ color: primaryColor }} /> Team & Org Chart
          </Link>
          <Link href={`/v/${slug}/staff`} className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cream-300 bg-white text-sm text-navy-700 hover:border-brand-300 transition">
            <UserPlus className="h-4 w-4" style={{ color: primaryColor }} /> Manage Staff
          </Link>
          <Link href={`/v/${slug}/equipment`} className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cream-300 bg-white text-sm text-navy-700 hover:border-brand-300 transition">
            <Briefcase className="h-4 w-4" style={{ color: primaryColor }} /> Equipment
          </Link>
          <Link href={`/v/${slug}/finance`} className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cream-300 bg-white text-sm text-navy-700 hover:border-brand-300 transition">
            <BarChart3 className="h-4 w-4" style={{ color: primaryColor }} /> Finance
          </Link>
          <Link href={`/v/${slug}/agent`} className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cream-300 bg-white text-sm text-navy-700 hover:border-brand-300 transition">
            <Sparkles className="h-4 w-4" style={{ color: primaryColor }} /> Fotiqo Agent
          </Link>
        </div>

        {/* Destinations */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-navy-900">Your Destinations</h2>
          {destinations.length > 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition"
              style={{ color: primaryColor }}
            >
              <Plus className="h-4 w-4" /> Add new
            </button>
          )}
        </div>

        {destinations.length === 0 ? (
          <div className="card p-10 text-center">
            <Building className="h-12 w-12 text-navy-300 mx-auto mb-4" />
            <h3 className="font-display text-lg text-navy-900 mb-2">No destinations yet</h3>
            <p className="text-sm text-navy-400 mb-6 max-w-md mx-auto">
              Add your first hotel, water park, or attraction to start managing photography operations.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition hover:opacity-90"
              style={{ background: primaryColor }}
            >
              <Plus className="h-5 w-5" /> Add Your First Destination
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((d) => (
              <Link key={d.id} href={`/v/${slug}/d/${d.slug}`} className="card p-5 hover:shadow-lift transition group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: primaryColor + "20", color: primaryColor }}>
                    {VENUE_TYPES.find((v) => v.value === d.venueType)?.label || d.venueType}
                  </span>
                  <ArrowRight className="h-4 w-4 text-navy-300 group-hover:text-navy-600 transition" />
                </div>
                <h3 className="font-display text-lg text-navy-900">{d.name}</h3>
                <p className="text-xs text-navy-400 mt-1">{d.city}{d.country ? `, ${d.country}` : ""}</p>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Destination Modal */}
      {showCreate && (
        <CreateDestinationModal
          slug={slug}
          primaryColor={primaryColor}
          onClose={() => setShowCreate(false)}
          onCreated={(dest) => {
            setDestinations((prev) => [...prev, dest]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

/* ─── Create Destination Modal ─────────────────────────── */

function CreateDestinationModal({
  slug,
  primaryColor,
  onClose,
  onCreated,
}: {
  slug: string;
  primaryColor: string;
  onClose: () => void;
  onCreated: (dest: Destination) => void;
}) {
  const [name, setName] = useState("");
  const [destSlug, setDestSlug] = useState("");
  const [venueType, setVenueType] = useState("HOTEL");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  }

  function handleNameChange(value: string) {
    setName(value);
    setDestSlug(generateSlug(value));
  }

  async function handleCreate() {
    if (!name.trim() || !destSlug.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: destSlug, venueType, city: city || undefined, country: country || undefined, address: address || undefined, currency }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create destination"); setSaving(false); return; }
      onCreated(data.destination);
    } catch {
      setError("Network error");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <h2 className="font-display text-xl text-navy-900">Add Destination</h2>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Venue Type */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Venue Type</label>
            <div className="grid grid-cols-2 gap-2">
              {VENUE_TYPES.map((vt) => {
                const Icon = vt.icon;
                const selected = venueType === vt.value;
                return (
                  <button
                    key={vt.value}
                    onClick={() => setVenueType(vt.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                      selected ? "border-current text-white" : "border-cream-200 text-navy-600 hover:border-cream-400"
                    }`}
                    style={selected ? { background: primaryColor, borderColor: primaryColor } : {}}
                  >
                    <Icon className="h-4 w-4" /> {vt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Destination Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Hilton Beach Resort"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            {destSlug && (
              <p className="text-xs text-navy-400 mt-1">URL: /v/{slug}/d/<span className="font-medium">{destSlug}</span></p>
            )}
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Monastir"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Tunisia"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Address <span className="text-navy-400">(optional)</span></label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="GBP">GBP (British Pound)</option>
              <option value="TND">TND (Tunisian Dinar)</option>
              <option value="MAD">MAD (Moroccan Dirham)</option>
              <option value="TRY">TRY (Turkish Lira)</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
        </div>

        <div className="flex gap-3 p-6 border-t border-cream-200">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-cream-300 text-navy-600 text-sm font-medium hover:bg-cream-100 transition">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{ background: primaryColor }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Create Destination"}
          </button>
        </div>
      </div>
    </div>
  );
}
