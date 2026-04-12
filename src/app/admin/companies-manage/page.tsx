"use client";

import { useState, useEffect } from "react";
interface Company {
  id: string;
  name: string;
  slug: string | null;
  type: string;
  brandName: string | null;
  country: string | null;
  city: string | null;
  commissionRate: number | null;
  destCount: number;
  staffCount: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalDest, setTotalDest] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ portalUrl: string; email: string } | null>(null);

  const [form, setForm] = useState({
    companyName: "",
    slug: "",
    ceoName: "",
    ceoEmail: "",
    ceoPassword: "",
    country: "",
    city: "",
    commissionRate: "0.05",
    brandName: "",
    brandPrimaryColor: "#0EA5A5",
  });

  useEffect(() => {
    fetch("/api/companies/list")
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data.companies || []);
        setTotalDest(data.totalDest || 0);
        setTotalStaff(data.totalStaff || 0);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, []);

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function updateField(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "companyName") next.slug = autoSlug(value);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const res = await fetch("/api/companies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          slug: form.slug,
          ceoName: form.ceoName,
          ceoEmail: form.ceoEmail,
          ceoPassword: form.ceoPassword,
          country: form.country || undefined,
          city: form.city || undefined,
          commissionRate: parseFloat(form.commissionRate) || undefined,
          brandName: form.brandName || undefined,
          brandPrimaryColor: form.brandPrimaryColor || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create company");
        return;
      }

      setSuccess({ portalUrl: data.portalUrl, email: data.ceoUser.email });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (dataLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-navy-900 mb-4">Companies</h1>
        <p className="text-navy-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy-900">Companies</h1>
          <p className="text-navy-500 text-sm mt-1">Venue partner photography companies</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 transition"
        >
          + Create Company
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="font-display text-2xl text-navy-900">{companies.length}</div>
          <div className="text-xs text-navy-400">Companies</div>
        </div>
        <div className="card p-5">
          <div className="font-display text-2xl text-navy-900">{totalDest}</div>
          <div className="text-xs text-navy-400">Destinations</div>
        </div>
        <div className="card p-5">
          <div className="font-display text-2xl text-navy-900">{totalStaff}</div>
          <div className="text-xs text-navy-400">Total staff</div>
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-navy-500">No companies yet.</p>
          <p className="text-sm text-navy-400 mt-1">Click &quot;Create Company&quot; to add the first venue company.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-5 py-3 bg-cream-50 border-b border-cream-200 text-xs font-semibold text-navy-500 uppercase tracking-wide">
            <div>Company</div><div>Destinations</div><div>Staff</div><div>Commission</div><div>Portal</div>
          </div>
          {companies.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-5 py-4 border-b border-cream-100 items-center hover:bg-cream-50 transition">
              <div>
                <div className="font-semibold text-navy-900 text-sm">{c.brandName || c.name}</div>
                <div className="text-xs text-navy-400">{c.country}{c.city ? `, ${c.city}` : ""} &middot; {c.type}</div>
              </div>
              <div className="text-sm text-navy-700 text-center">{c.destCount}</div>
              <div className="text-sm text-navy-700 text-center">{c.staffCount}</div>
              <div className="text-sm text-navy-700 text-center">{c.commissionRate ? `${(c.commissionRate * 100).toFixed(0)}%` : "Tiered"}</div>
              <div>
                {c.slug && (
                  <a href={`/v/${c.slug}`} className="text-xs text-brand-500 hover:text-brand-700">
                    /v/{c.slug}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Company Modal */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => !loading && setOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-cream-200">
                <h2 className="font-display text-xl text-navy-900">Create Venue Company</h2>
                <button onClick={() => !loading && setOpen(false)} className="text-navy-400 hover:text-navy-700 text-xl font-bold">
                  &times;
                </button>
              </div>

              {success ? (
                <div className="p-6 space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="font-semibold text-green-800 mb-2">Company created successfully!</p>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Portal:</strong> <code className="bg-green-100 px-2 py-0.5 rounded">{success.portalUrl}</code></p>
                      <p><strong>CEO login:</strong> {success.email}</p>
                      <p><strong>Password:</strong> {form.ceoPassword}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setOpen(false);
                      setSuccess(null);
                      setForm({ companyName: "", slug: "", ceoName: "", ceoEmail: "", ceoPassword: "", country: "", city: "", commissionRate: "0.05", brandName: "", brandPrimaryColor: "#0EA5A5" });
                      window.location.reload();
                    }}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl py-3 transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide">Company Info</p>
                    <div>
                      <label className="text-xs font-medium text-navy-600 mb-1 block">Company Name *</label>
                      <input type="text" required value={form.companyName} onChange={(e) => updateField("companyName", e.target.value)} placeholder="e.g. Hilton Monastir Photography" className="w-full border border-cream-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-navy-600 mb-1 block">URL Slug *</label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-navy-400">fotiqo.com/v/</span>
                        <input type="text" required pattern="[a-z0-9-]+" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="hilton-monastir" className="flex-1 border border-cream-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide">CEO Account</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-navy-600 mb-1 block">CEO Name *</label>
                        <input type="text" required value={form.ceoName} onChange={(e) => updateField("ceoName", e.target.value)} placeholder="John Smith" className="w-full border border-cream-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-navy-600 mb-1 block">CEO Email *</label>
                        <input type="email" required value={form.ceoEmail} onChange={(e) => updateField("ceoEmail", e.target.value)} placeholder="ceo@company.com" className="w-full border border-cream-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-navy-600 mb-1 block">CEO Password *</label>
                      <input type="text" required minLength={8} value={form.ceoPassword} onChange={(e) => updateField("ceoPassword", e.target.value)} placeholder="Min 8 characters" className="w-full border border-cream-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide">Location</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-navy-600 mb-1 block">Country</label>
                        <input type="text" value={form.country} onChange={(e) => updateField("country", e.target.value)} placeholder="Tunisia" className="w-full border border-cream-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-navy-600 mb-1 block">City</label>
                        <input type="text" value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Monastir" className="w-full border border-cream-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide">Branding & Commission</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-navy-600 mb-1 block">Brand Name</label>
                        <input type="text" value={form.brandName} onChange={(e) => updateField("brandName", e.target.value)} placeholder="Same as company name" className="w-full border border-cream-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-navy-600 mb-1 block">Brand Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={form.brandPrimaryColor} onChange={(e) => updateField("brandPrimaryColor", e.target.value)} className="w-10 h-10 rounded-lg border border-cream-300 cursor-pointer" />
                          <input type="text" value={form.brandPrimaryColor} onChange={(e) => updateField("brandPrimaryColor", e.target.value)} className="flex-1 border border-cream-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-navy-600 mb-1 block">Commission Rate (%)</label>
                      <select value={form.commissionRate} onChange={(e) => updateField("commissionRate", e.target.value)} className="w-full border border-cream-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none">
                        <option value="0.02">2% (Large operations)</option>
                        <option value="0.03">3% (Medium-large)</option>
                        <option value="0.05">5% (Medium)</option>
                        <option value="0.07">7% (Small-medium)</option>
                        <option value="0.10">10% (Small operations)</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-50">
                    {loading ? "Creating..." : "+ Create Company"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
