"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Settings, Save, CheckCircle2,
} from "lucide-react";

const CURRENCIES = [
  { value: "EUR", label: "EUR (Euro)" },
  { value: "USD", label: "USD (US Dollar)" },
  { value: "GBP", label: "GBP (British Pound)" },
  { value: "TND", label: "TND (Tunisian Dinar)" },
  { value: "MAD", label: "MAD (Moroccan Dirham)" },
  { value: "TRY", label: "TRY (Turkish Lira)" },
];

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#0EA5A5");
  const [companyName, setCompanyName] = useState("");

  // Form fields
  const [orgName, setOrgName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandColor, setBrandColor] = useState("#0EA5A5");
  const [defaultCurrency, setDefaultCurrency] = useState("EUR");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [dashRes, settingsRes] = await Promise.all([
        fetch(`/api/v/${slug}/dashboard`),
        fetch(`/api/v/${slug}/settings`),
      ]);
      if (!dashRes.ok) { router.push(`/v/${slug}`); return; }
      const dashData = await dashRes.json();

      const org = dashData.org;
      setPrimaryColor(org?.brandPrimaryColor || "#0EA5A5");
      setCompanyName(org?.brandName || org?.name || "Company");
      setOrgName(org?.name || "");
      setBrandName(org?.brandName || "");
      setBrandColor(org?.brandPrimaryColor || "#0EA5A5");

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.defaultCurrency) setDefaultCurrency(settingsData.defaultCurrency);
        if (settingsData.brandName) setBrandName(settingsData.brandName);
        if (settingsData.brandPrimaryColor) setBrandColor(settingsData.brandPrimaryColor);
      }
    } catch {
      router.push(`/v/${slug}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setShowSuccess(false);

    try {
      const res = await fetch(`/api/v/${slug}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim() || null,
          brandPrimaryColor: brandColor,
          defaultCurrency,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to save settings");
        setSaving(false);
        return;
      }
      setPrimaryColor(brandColor);
      setCompanyName(brandName.trim() || orgName);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      alert("Network error");
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
        <div className="max-w-5xl mx-auto">
          <Link href={`/v/${slug}/dashboard`} className="text-xs text-navy-400 hover:text-brand-500 flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3 w-3" /> Back to {companyName}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl text-navy-900">Settings</h1>
              <p className="text-sm text-navy-400">Company configuration</p>
            </div>
            <Settings className="h-5 w-5 text-navy-300" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Success Toast */}
        {showSuccess && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved successfully
          </div>
        )}

        <div className="card p-6 max-w-2xl">
          <h2 className="font-display text-lg text-navy-900 mb-6">Company Details</h2>

          <div className="space-y-5">
            {/* Company Name (readonly) */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Company Name</label>
              <input
                type="text"
                value={orgName}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-500 bg-cream-50 cursor-not-allowed"
              />
              <p className="text-xs text-navy-400 mt-1">Contact support to change your company name</p>
            </div>

            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. My Photo Studio"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              <p className="text-xs text-navy-400 mt-1">Displayed on your portal and customer-facing pages</p>
            </div>

            {/* Brand Color */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-12 h-10 rounded-lg border border-cream-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  placeholder="#0EA5A5"
                  maxLength={7}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300 font-mono text-sm"
                />
                <div className="w-10 h-10 rounded-xl border border-cream-200" style={{ background: brandColor }} />
              </div>
              <p className="text-xs text-navy-400 mt-1">Used for buttons, accents, and branding throughout your portal</p>
            </div>

            {/* Default Currency */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Default Currency</label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
              style={{ background: primaryColor }}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
