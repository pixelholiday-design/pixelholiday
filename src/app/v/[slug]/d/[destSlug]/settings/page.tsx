"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Settings, Loader2, Save, CheckCircle2,
} from "lucide-react";

type OrgInfo = {
  id: string;
  name: string;
  brandName: string | null;
  brandPrimaryColor: string | null;
};

type Destination = {
  id: string;
  name: string;
  slug: string;
  venueType: string;
  address: string | null;
  city: string | null;
  country: string | null;
  currency: string;
  timezone: string;
};

const VENUE_TYPES = [
  { value: "HOTEL", label: "Hotel" },
  { value: "WATER_PARK", label: "Water Park" },
  { value: "ATTRACTION", label: "Attraction" },
  { value: "SELF_SERVICE", label: "Self-Service" },
];

const TIMEZONES = [
  "Europe/Tunis",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Istanbul",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Tokyo",
];

const CURRENCIES = ["EUR", "USD", "GBP", "TND", "AED", "CHF", "CAD", "AUD"];

export default function DestinationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const destSlug = params.destSlug as string;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [venueType, setVenueType] = useState("HOTEL");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [timezone, setTimezone] = useState("Europe/Tunis");

  const primaryColor = org?.brandPrimaryColor || "#0EA5A5";

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/v/${slug}/dashboard`);
        if (!res.ok) { router.push(`/v/${slug}`); return; }
        const data = await res.json();
        setOrg(data.org);

        const dest = (data.destinations || []).find(
          (d: Destination) => d.slug === destSlug
        );
        if (dest) {
          setDestination(dest);
          setName(dest.name || "");
          setVenueType(dest.venueType || "HOTEL");
          setCity(dest.city || "");
          setCountry(dest.country || "");
          setAddress(dest.address || "");
          setCurrency(dest.currency || "EUR");
          setTimezone(dest.timezone || "Europe/Tunis");
        }
      } catch {
        router.push(`/v/${slug}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, destSlug, router]);

  async function handleSave() {
    if (!destination) return;
    if (!name.trim()) {
      setError("Destination name is required");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch(`/api/destinations/${destination.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          venueType,
          city: city.trim() || null,
          country: country.trim() || null,
          address: address.trim() || null,
          currency,
          timezone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save settings");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
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
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/v/${slug}/d/${destSlug}`}
            className="text-xs text-navy-400 hover:text-brand-500 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back to {destination?.name || "Destination"}
          </Link>
          <h1 className="font-display text-2xl text-navy-900">Destination Settings</h1>
          {destination && (
            <p className="text-sm text-navy-400">{destination.name}</p>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="card p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Destination Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hilton Monastir"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Venue Type */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Venue Type
            </label>
            <select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              {VENUE_TYPES.map((vt) => (
                <option key={vt.value} value={vt.value}>
                  {vt.label}
                </option>
              ))}
            </select>
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Monastir"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Country
              </label>
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
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full street address"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Currency & Timezone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">
              {error}
            </p>
          )}
          {saved && (
            <p className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Settings saved successfully
            </p>
          )}

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
              style={{ background: primaryColor }}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
