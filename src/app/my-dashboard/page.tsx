"use client";
import { useEffect, useState } from "react";

export default function MyDashboard() {
  const [orgId, setOrgId] = useState("");
  const [sub, setSub] = useState<any>(null);
  const [branding, setBranding] = useState<any>({ logoUrl: "", primaryColor: "#ea580c", secondaryColor: "#fde68a", subdomain: "" });
  const [savingBrand, setSavingBrand] = useState("");

  async function load() {
    if (!orgId) return;
    const s = await fetch(`/api/saas/subscription?orgId=${orgId}`).then((r) => r.json());
    setSub(s);
    const b = await fetch(`/api/saas/branding?orgId=${orgId}`).then((r) => r.json());
    setBranding({ ...branding, ...b });
  }

  async function saveBranding() {
    setSavingBrand("Saving…");
    await fetch("/api/saas/branding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, ...branding }),
    });
    setSavingBrand("✓ Saved");
  }

  useEffect(() => { if (orgId) load(); /* eslint-disable-next-line */ }, [orgId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">My SaaS Dashboard</h1>
        <input
          className="border p-2 rounded w-full mb-4"
          placeholder="Enter your Organization ID"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          onBlur={load}
        />

        {sub && (
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="text-sm text-gray-500">Plan</div>
              <div className="text-2xl font-bold">{sub.config?.name}</div>
              <div className="text-xs">${(sub.config?.priceMonthly / 100).toFixed(2)}/month</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="text-sm text-gray-500">Photos this month</div>
              <div className="text-2xl font-bold">{sub.usage?.photosThisMonth} / {sub.config?.photosPerMonth === -1 ? "∞" : sub.config?.photosPerMonth}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="text-sm text-gray-500">Active Galleries</div>
              <div className="text-2xl font-bold">{sub.usage?.activeGalleries} / {sub.config?.activeGalleries === -1 ? "∞" : sub.config?.activeGalleries}</div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Custom Branding</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Logo URL" value={branding.logoUrl || ""} onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Subdomain placeholder" value={branding.subdomain || ""} onChange={(e) => setBranding({ ...branding, subdomain: e.target.value })} />
            <label className="flex items-center gap-2">Primary <input type="color" value={branding.primaryColor || "#ea580c"} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} /></label>
            <label className="flex items-center gap-2">Secondary <input type="color" value={branding.secondaryColor || "#fde68a"} onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })} /></label>
          </div>
          <button onClick={saveBranding} className="mt-4 bg-orange-600 text-white px-4 py-2 rounded">Save Branding</button>
          <span className="ml-3 text-sm">{savingBrand}</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
          <div className="flex gap-3 flex-wrap">
            <a href="/admin/upload" className="bg-blue-600 text-white px-4 py-2 rounded">Upload to Client Gallery</a>
            <a href="#" className="bg-green-600 text-white px-4 py-2 rounded">Share Magic Links</a>
            <a href="#" className="bg-purple-600 text-white px-4 py-2 rounded">View Sales Analytics</a>
            <a href="#" className="bg-pink-600 text-white px-4 py-2 rounded">Manage Clients</a>
          </div>
          <p className="mt-3 text-xs text-gray-500">SaaS revenue: 2% commission auto-calculated on every sale.</p>
        </div>
      </div>
    </div>
  );
}
