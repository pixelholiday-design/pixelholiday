"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function FranchiseBrandingPage() {
  const params = useParams();
  const orgId = params.orgId as string;

  const [branding, setBranding] = useState({
    brandColor: "#29ABE2",
    logoUrl: "",
    tagline: "",
    customDomain: "",
    name: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/saas/branding?orgId=${orgId}`)
      .then((r) => r.json())
      .then((d) => {
        setBranding({
          brandColor: d.brandColor || "#29ABE2",
          logoUrl: d.logoUrl || "",
          tagline: d.tagline || "",
          customDomain: d.customDomain || "",
          name: d.name || "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orgId]);

  async function save() {
    setStatus("Saving...");
    const res = await fetch("/api/saas/branding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, ...branding }),
    });
    const data = await res.json();
    if (res.ok) setStatus("Saved!");
    else setStatus(`Error: ${data.error}`);
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Brand Settings — {branding.name}</h1>
      <p className="text-sm text-slate-500 mb-6">Customize the white-label branding for this franchise.</p>

      <div className="max-w-xl space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.brandColor}
                onChange={(e) => setBranding({ ...branding, brandColor: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                className="border rounded px-3 py-2 flex-1 font-mono"
                value={branding.brandColor}
                onChange={(e) => setBranding({ ...branding, brandColor: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={branding.logoUrl}
              onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
            {branding.logoUrl && (
              <img src={branding.logoUrl} alt="Logo preview" className="mt-2 h-12 object-contain" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={branding.tagline}
              onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
              placeholder="Capture your escape"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Custom Domain</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={branding.customDomain}
              onChange={(e) => setBranding({ ...branding, customDomain: e.target.value })}
              placeholder="photos.myresort.com"
            />
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">Preview</h2>
          <div
            className="rounded-lg p-6 text-white"
            style={{ backgroundColor: branding.brandColor }}
          >
            {branding.logoUrl && (
              <img src={branding.logoUrl} alt="Logo" className="h-8 mb-2 object-contain" />
            )}
            <div className="text-xl font-bold">{branding.name || "Franchise Name"}</div>
            <div className="text-sm opacity-80">{branding.tagline || "Your tagline here"}</div>
          </div>
        </div>

        <button
          onClick={save}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800"
        >
          Save Branding
        </button>
        {status && <p className="text-sm text-slate-600">{status}</p>}
      </div>
    </div>
  );
}
