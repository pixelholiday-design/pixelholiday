"use client";
import { useEffect, useState } from "react";
import { Settings, User, Globe, Palette, Mail, Save, Loader2, Type, Trash2, Upload, Plus, CreditCard, ExternalLink } from "lucide-react";

export default function DashboardSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setProfile(d.user || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-12 text-navy-400">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-6 w-6 text-brand-500" />
        <div>
          <h1 className="font-display text-3xl text-navy-900">Settings</h1>
          <p className="text-navy-500 text-sm mt-0.5">Manage your studio profile and preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile section */}
        <div className="card p-6">
          <h2 className="font-display text-lg text-navy-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-navy-400" /> Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label-xs block mb-1.5">Display name</label>
              <input className="input" defaultValue={profile?.name || ""} placeholder="Your name" />
            </div>
            <div>
              <label className="label-xs block mb-1.5">Email</label>
              <input className="input bg-cream-100 text-navy-400" defaultValue={profile?.email || ""} disabled />
            </div>
          </div>
        </div>

        {/* Branding section */}
        <div className="card p-6">
          <h2 className="font-display text-lg text-navy-900 mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-navy-400" /> Branding
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label-xs block mb-1.5">Business name</label>
              <input className="input" placeholder="Your Photography Studio" />
            </div>
            <div>
              <label className="label-xs block mb-1.5">Tagline</label>
              <input className="input" placeholder="Capturing moments that matter" />
            </div>
          </div>
        </div>

        {/* Website section */}
        <div className="card p-6">
          <h2 className="font-display text-lg text-navy-900 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-navy-400" /> Website
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label-xs block mb-1.5">Custom domain</label>
              <input className="input" placeholder="photos.yourdomain.com" />
              <p className="text-xs text-navy-400 mt-1">Point a CNAME record to fotiqo.com</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <h2 className="font-display text-lg text-navy-900 mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-navy-400" /> Notifications
          </h2>
          <div className="space-y-3">
            {[
              "New booking notification",
              "New inquiry notification",
              "Gallery viewed by client",
              "Order completed",
              "New review received",
            ].map((item) => (
              <label key={item} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-navy-300 text-brand-500 focus:ring-brand-400" />
                <span className="text-sm text-navy-700">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Billing */}
        <BillingSection />

        {/* Custom Fonts */}
        <FontSection />

        <button className="btn-primary !py-3 w-full sm:w-auto sm:px-8">
          <Save className="h-4 w-4" /> Save changes
        </button>
      </div>
    </div>
  );
}

function BillingSection() {
  const [opening, setOpening] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInv, setLoadingInv] = useState(true);

  useEffect(() => {
    fetch("/api/subscription/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices || []))
      .catch(() => {})
      .finally(() => setLoadingInv(false));
  }, []);

  async function openBillingPortal() {
    setOpening(true);
    try {
      const res = await fetch("/api/subscription/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setOpening(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="font-display text-lg text-navy-900 mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-navy-400" /> Billing
      </h2>
      <div className="space-y-4">
        <button
          onClick={openBillingPortal}
          disabled={opening}
          className="btn-secondary"
        >
          <ExternalLink className="h-4 w-4" />
          {opening ? "Opening..." : "Manage Billing & Subscription"}
        </button>

        {loadingInv ? (
          <div className="text-center py-3 text-navy-400"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>
        ) : invoices.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-navy-700 mb-2">Recent Invoices</h3>
            <div className="space-y-1">
              {invoices.slice(0, 5).map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between bg-cream-50 rounded-lg px-3 py-2 text-sm">
                  <div>
                    <span className="text-navy-700">{inv.number || inv.id.slice(0, 12)}</span>
                    {inv.date && <span className="text-navy-400 ml-2">{new Date(inv.date).toLocaleDateString()}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-navy-600 font-medium">{inv.currency} {inv.amount?.toFixed(2)}</span>
                    {inv.pdfUrl && (
                      <a href={inv.pdfUrl} target="_blank" rel="noopener" className="text-brand-500 hover:text-brand-600 text-xs">PDF</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-navy-400">No invoices yet.</p>
        )}
      </div>
    </div>
  );
}

type Font = { id: string; name: string; family: string; fileUrl: string; format: string; weight: string; style: string };

function FontSection() {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newFont, setNewFont] = useState({ name: "", fileUrl: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/fonts").then((r) => r.json()).then((d) => setFonts(d.fonts || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function addFont() {
    if (!newFont.name || !newFont.fileUrl) return;
    setAdding(true);
    const format = newFont.fileUrl.match(/\.(woff2|woff|ttf|otf)/)?.[1] || "woff2";
    const res = await fetch("/api/fonts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newFont, format, family: newFont.name.replace(/\s+/g, "") }),
    }).then((r) => r.json());
    if (res.font) setFonts((prev) => [res.font, ...prev]);
    setNewFont({ name: "", fileUrl: "" });
    setShowAdd(false);
    setAdding(false);
  }

  async function deleteFont(id: string) {
    await fetch(`/api/fonts/${id}`, { method: "DELETE" });
    setFonts((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-navy-900 flex items-center gap-2">
          <Type className="h-5 w-5 text-navy-400" /> Custom Fonts
        </h2>
        <span className="text-xs text-navy-400">{fonts.length}/10 fonts</span>
      </div>
      <p className="text-xs text-navy-400 mb-4">Upload .woff2, .woff, .ttf, or .otf fonts for your portfolio website.</p>

      {loading ? (
        <div className="text-center py-4 text-navy-400"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
      ) : (
        <>
          {fonts.length > 0 && (
            <div className="space-y-2 mb-4">
              {fonts.map((f) => (
                <div key={f.id} className="flex items-center justify-between bg-cream-50 rounded-xl px-4 py-3">
                  <div>
                    <div className="font-semibold text-navy-900 text-sm">{f.name}</div>
                    <div className="text-xs text-navy-400">{f.format} &middot; {f.weight} &middot; {f.style}</div>
                    <div className="text-sm text-navy-600 mt-1" style={{ fontFamily: f.family }}>
                      The quick brown fox jumps over the lazy dog
                    </div>
                  </div>
                  <button onClick={() => deleteFont(f.id)} className="text-coral-400 hover:text-coral-600 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showAdd ? (
            <div className="bg-cream-50 rounded-xl p-4 space-y-3">
              <div>
                <label className="label-xs block mb-1">Font name</label>
                <input className="input text-sm" value={newFont.name} onChange={(e) => setNewFont({ ...newFont, name: e.target.value })} placeholder="My Custom Font" />
              </div>
              <div>
                <label className="label-xs block mb-1">Font file URL</label>
                <input className="input text-sm" value={newFont.fileUrl} onChange={(e) => setNewFont({ ...newFont, fileUrl: e.target.value })} placeholder="https://fonts.example.com/myfont.woff2" />
                <p className="text-[10px] text-navy-400 mt-1">Upload your font to R2 or any CDN and paste the URL here.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="btn-secondary text-xs flex-1">Cancel</button>
                <button onClick={addFont} disabled={adding || !newFont.name || !newFont.fileUrl} className="btn-primary text-xs flex-1">
                  {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Add font
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAdd(true)} disabled={fonts.length >= 10} className="btn-secondary w-full">
              <Upload className="h-4 w-4" /> Upload custom font
            </button>
          )}
        </>
      )}
    </div>
  );
}
