"use client";
import { useState, useEffect } from "react";

interface LocationOption {
  id: string;
  name: string;
}

export default function NewFranchisePage() {
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    country: "",
    revenueSharePercent: 2,
    parentOrgId: "",
    locationIds: [] as string[],
  });
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/locations")
      .then((r) => r.json())
      .then((d) => setLocations(d.locations || []))
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Creating franchise...");
    setResult(null);

    const res = await fetch("/api/franchise/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setStatus("Franchise created successfully!");
      setResult(data);
    } else {
      setStatus(`Error: ${data.error}`);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Create New Franchise</h1>
      <p className="text-sm text-slate-500 mb-6">
        Onboard a new franchise partner with their own locations and branding.
      </p>

      <form onSubmit={submit} className="max-w-2xl space-y-4">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-lg">Business Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Name *</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g., Tunisia"
              />
            </div>
          </div>

          <h2 className="font-semibold text-lg mt-6">Owner / Manager</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name *</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Owner Email *</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="email"
                value={form.ownerEmail}
                onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.ownerPhone}
                onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Parent Org ID *</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.parentOrgId}
                onChange={(e) => setForm({ ...form, parentOrgId: e.target.value })}
                required
                placeholder="HQ organization ID"
              />
            </div>
          </div>

          <h2 className="font-semibold text-lg mt-6">Revenue Sharing</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SaaS Commission Rate: {form.revenueSharePercent}%
            </label>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={form.revenueSharePercent}
              onChange={(e) => setForm({ ...form, revenueSharePercent: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {locations.length > 0 && (
            <>
              <h2 className="font-semibold text-lg mt-6">Assign Locations</h2>
              <div className="grid grid-cols-2 gap-2">
                {locations.map((loc) => (
                  <label key={loc.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.locationIds.includes(loc.id)}
                      onChange={(e) => {
                        const ids = e.target.checked
                          ? [...form.locationIds, loc.id]
                          : form.locationIds.filter((id) => id !== loc.id);
                        setForm({ ...form, locationIds: ids });
                      }}
                    />
                    {loc.name}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800"
        >
          Create Franchise
        </button>

        {status && (
          <p className={`text-sm mt-2 ${result ? "text-green-600" : "text-slate-600"}`}>{status}</p>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm space-y-1">
            <p><strong>Franchise ID:</strong> {result.franchiseId}</p>
            <p><strong>User ID:</strong> {result.userId}</p>
            <p><strong>Temp Password:</strong> <code className="bg-green-100 px-1 rounded">{result.tempPassword}</code></p>
            <p className="text-green-700">A welcome email has been sent to the franchise owner.</p>
          </div>
        )}
      </form>
    </div>
  );
}
