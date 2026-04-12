"use client";

import { useState, useCallback } from "react";
import { THEMES, FONT_CHOICES, SPECIALTIES, EXPERIENCE_OPTIONS, DEFAULT_SECTIONS, type SectionConfig, type WebsiteTheme } from "@/lib/website-themes";

type Profile = {
  id?: string;
  username?: string;
  businessName?: string;
  tagline?: string;
  bio?: string;
  profilePhotoUrl?: string;
  coverPhotoUrl?: string;
  specialties?: string[];
  experience?: string;
  equipment?: string[];
  languages?: string[];
  city?: string;
  country?: string;
  serviceAreaKm?: number;
  priceRange?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialWebsite?: string;
  socialTiktok?: string;
  isPublicProfile?: boolean;
  websiteTheme?: string;
  primaryColor?: string;
  fontChoice?: string;
  logoUrl?: string;
  sections?: string;
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  featuredGalleryIds?: string[];
  whatsappEnabled?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  whatsappPosition?: string;
  services?: { id: string; name: string; description?: string; startingAt?: number; currency: string; duration?: string; sortOrder: number }[];
  testimonials?: { id: string; clientName: string; content: string; rating: number; eventType?: string; isVisible: boolean; sortOrder: number }[];
};

type Gallery = { id: string; magicLinkToken: string; createdAt: string; photos: { id: string; s3Key_highRes: string; cloudinaryId?: string }[] };

interface Props {
  profile: Profile | null;
  galleries: Gallery[];
  user: { name: string; email: string };
}

type Tab = "profile" | "theme" | "sections" | "services" | "testimonials" | "seo" | "preview";

export default function WebsiteBuilderClient({ profile: initial, galleries, user }: Props) {
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Profile>({
    username: initial?.username || "",
    businessName: initial?.businessName || user.name,
    tagline: initial?.tagline || "",
    bio: initial?.bio || "",
    profilePhotoUrl: initial?.profilePhotoUrl || "",
    coverPhotoUrl: initial?.coverPhotoUrl || "",
    specialties: initial?.specialties || [],
    experience: initial?.experience || "",
    equipment: initial?.equipment || [],
    languages: initial?.languages || [],
    city: initial?.city || "",
    country: initial?.country || "",
    serviceAreaKm: initial?.serviceAreaKm || undefined,
    priceRange: initial?.priceRange || "",
    socialInstagram: initial?.socialInstagram || "",
    socialFacebook: initial?.socialFacebook || "",
    socialWebsite: initial?.socialWebsite || "",
    socialTiktok: initial?.socialTiktok || "",
    isPublicProfile: initial?.isPublicProfile ?? true,
    websiteTheme: initial?.websiteTheme || "minimal",
    primaryColor: initial?.primaryColor || "#0EA5A5",
    fontChoice: initial?.fontChoice || "inter",
    logoUrl: initial?.logoUrl || "",
    sections: initial?.sections || JSON.stringify(DEFAULT_SECTIONS),
    customDomain: initial?.customDomain || "",
    seoTitle: initial?.seoTitle || "",
    seoDescription: initial?.seoDescription || "",
    seoImage: initial?.seoImage || "",
    featuredGalleryIds: initial?.featuredGalleryIds || [],
    whatsappEnabled: initial?.whatsappEnabled ?? false,
    whatsappNumber: initial?.whatsappNumber || "",
    whatsappMessage: initial?.whatsappMessage || "",
    whatsappPosition: initial?.whatsappPosition || "bottom-right",
  });
  const [services, setServices] = useState(initial?.services || []);
  const [testimonials, setTestimonials] = useState(initial?.testimonials || []);
  const [newEquip, setNewEquip] = useState("");
  const [newLang, setNewLang] = useState("");

  const sections: SectionConfig[] = (() => {
    try { return JSON.parse(form.sections || "[]"); } catch { return DEFAULT_SECTIONS; }
  })();

  const update = useCallback((patch: Partial<Profile>) => setForm(f => ({ ...f, ...patch })), []);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/photographer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sections: typeof form.sections === "string" ? JSON.parse(form.sections) : form.sections }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "theme", label: "Theme & Brand" },
    { key: "sections", label: "Sections" },
    { key: "services", label: "Services" },
    { key: "testimonials", label: "Testimonials" },
    { key: "seo", label: "SEO & Domain" },
    { key: "preview", label: "Preview" },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">&larr; Dashboard</a>
            <h1 className="text-lg font-bold text-slate-900">Website Builder</h1>
          </div>
          <div className="flex items-center gap-3">
            {form.username && (
              <a href={`/p/${form.username}`} target="_blank" className="text-sm text-brand-500 hover:text-brand-700">
                View Site &rarr;
              </a>
            )}
            <button onClick={save} disabled={saving} className="px-4 py-2 bg-coral-500 text-white rounded-lg text-sm font-semibold hover:bg-coral-600 disabled:opacity-50">
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-slate-200 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ${tab === t.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === "profile" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-bold text-lg text-slate-900">Basic Info</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username (URL slug)</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">fotiqo.com/p/</span>
                  <input className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.username} onChange={e => update({ username: e.target.value })} placeholder="your-name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.businessName} onChange={e => update({ businessName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.tagline} onChange={e => update({ tagline: e.target.value })} placeholder="Capturing moments that matter" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio (up to 500 words)</label>
                <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm h-32 resize-y" value={form.bio} onChange={e => update({ bio: e.target.value })} placeholder="Tell potential clients about yourself..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profile Photo URL</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.profilePhotoUrl} onChange={e => update({ profilePhotoUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cover Photo URL</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.coverPhotoUrl} onChange={e => update({ coverPhotoUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="font-bold text-lg text-slate-900">Details</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.experience} onChange={e => update({ experience: e.target.value })}>
                    <option value="">Select...</option>
                    {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specialties</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map(s => (
                      <button key={s} type="button" onClick={() => {
                        const arr = form.specialties || [];
                        update({ specialties: arr.includes(s) ? arr.filter(x => x !== s) : [...arr, s] });
                      }} className={`px-3 py-1 rounded-full text-xs font-medium border transition ${(form.specialties || []).includes(s) ? "bg-brand-500 text-white border-brand-500" : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Equipment</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(form.equipment || []).map((e, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 rounded text-xs flex items-center gap-1">
                        {e}
                        <button onClick={() => update({ equipment: (form.equipment || []).filter((_, j) => j !== i) })} className="text-slate-400 hover:text-red-500">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm" value={newEquip} onChange={e => setNewEquip(e.target.value)} placeholder="Add equipment..." onKeyDown={e => { if (e.key === "Enter" && newEquip.trim()) { update({ equipment: [...(form.equipment || []), newEquip.trim()] }); setNewEquip(""); } }} />
                    <button type="button" onClick={() => { if (newEquip.trim()) { update({ equipment: [...(form.equipment || []), newEquip.trim()] }); setNewEquip(""); } }} className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">Add</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Languages</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(form.languages || []).map((l, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 rounded text-xs flex items-center gap-1">
                        {l}
                        <button onClick={() => update({ languages: (form.languages || []).filter((_, j) => j !== i) })} className="text-slate-400 hover:text-red-500">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm" value={newLang} onChange={e => setNewLang(e.target.value)} placeholder="Add language..." onKeyDown={e => { if (e.key === "Enter" && newLang.trim()) { update({ languages: [...(form.languages || []), newLang.trim()] }); setNewLang(""); } }} />
                    <button type="button" onClick={() => { if (newLang.trim()) { update({ languages: [...(form.languages || []), newLang.trim()] }); setNewLang(""); } }} className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">Add</button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="font-bold text-lg text-slate-900">Location & Pricing</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.city} onChange={e => update({ city: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                    <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.country} onChange={e => update({ country: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Area (km)</label>
                  <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.serviceAreaKm || ""} onChange={e => update({ serviceAreaKm: parseInt(e.target.value) || undefined })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price Range</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.priceRange} onChange={e => update({ priceRange: e.target.value })} placeholder="e.g. €200-€500/session" />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="font-bold text-lg text-slate-900">Social Links</h2>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Instagram URL" value={form.socialInstagram} onChange={e => update({ socialInstagram: e.target.value })} />
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Facebook URL" value={form.socialFacebook} onChange={e => update({ socialFacebook: e.target.value })} />
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="TikTok URL" value={form.socialTiktok} onChange={e => update({ socialTiktok: e.target.value })} />
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Personal Website" value={form.socialWebsite} onChange={e => update({ socialWebsite: e.target.value })} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isPublicProfile} onChange={e => update({ isPublicProfile: e.target.checked })} className="rounded" />
                  Show profile in public marketplace
                </label>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#25D366" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <h2 className="font-bold text-lg text-slate-900">WhatsApp Button</h2>
                </div>
                <p className="text-sm text-slate-500">Add a floating WhatsApp chat button to your website so visitors can message you instantly.</p>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.whatsappEnabled} onChange={e => update({ whatsappEnabled: e.target.checked })} className="rounded" />
                  <span className="font-medium text-slate-700">Enable WhatsApp button</span>
                </label>
                {form.whatsappEnabled && (
                  <div className="space-y-3 pl-0.5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
                      <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.whatsappNumber} onChange={e => update({ whatsappNumber: e.target.value })} placeholder="+21612345678" />
                      <p className="text-xs text-slate-400 mt-1">Include country code, e.g. +216 for Tunisia</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Pre-filled Message (optional)</label>
                      <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm h-20 resize-none" value={form.whatsappMessage} onChange={e => update({ whatsappMessage: e.target.value })} placeholder="Hi! I found you on your website and I'd like to inquire about your photography services." />
                      <p className="text-xs text-slate-400 mt-1">Leave empty to use the default greeting with your business name</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Button Position</label>
                      <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.whatsappPosition} onChange={e => update({ whatsappPosition: e.target.value })}>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Theme Tab */}
        {tab === "theme" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-bold text-lg text-slate-900 mb-4">Choose Theme</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.entries(THEMES) as [WebsiteTheme, typeof THEMES[WebsiteTheme]][]).map(([key, theme]) => (
                  <button key={key} onClick={() => update({ websiteTheme: key })} className={`rounded-xl border-2 p-4 text-left transition ${form.websiteTheme === key ? "border-brand-500 ring-2 ring-brand-200" : "border-slate-200 hover:border-slate-300"}`}>
                    <div className={`w-full h-24 rounded-lg mb-3 ${theme.preview} flex items-center justify-center text-sm font-medium`}>
                      {theme.name}
                    </div>
                    <div className="font-semibold text-sm">{theme.name}</div>
                    <div className="text-xs text-slate-500">{theme.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-bold text-lg text-slate-900">Brand Settings</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={form.primaryColor} onChange={e => update({ primaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                    <input className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono" value={form.primaryColor} onChange={e => update({ primaryColor: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Font</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.fontChoice} onChange={e => update({ fontChoice: e.target.value })}>
                    {Object.entries(FONT_CHOICES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.logoUrl} onChange={e => update({ logoUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
          </div>
        )}

        {/* Sections Tab */}
        {tab === "sections" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-bold text-lg text-slate-900 mb-4">Page Sections</h2>
            <p className="text-sm text-slate-500 mb-4">Toggle sections on/off and reorder by dragging.</p>
            <div className="space-y-2">
              {sections.sort((a, b) => a.order - b.order).map((sec, i) => (
                <div key={sec.type} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex flex-col gap-0.5">
                    <button disabled={i === 0} onClick={() => {
                      const arr = [...sections];
                      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                      arr.forEach((s, j) => s.order = j);
                      update({ sections: JSON.stringify(arr) });
                    }} className="text-slate-400 hover:text-slate-600 text-xs disabled:opacity-30">&uarr;</button>
                    <button disabled={i === sections.length - 1} onClick={() => {
                      const arr = [...sections];
                      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                      arr.forEach((s, j) => s.order = j);
                      update({ sections: JSON.stringify(arr) });
                    }} className="text-slate-400 hover:text-slate-600 text-xs disabled:opacity-30">&darr;</button>
                  </div>
                  <label className="flex items-center gap-2 flex-1">
                    <input type="checkbox" checked={sec.visible} onChange={() => {
                      const arr = sections.map(s => s.type === sec.type ? { ...s, visible: !s.visible } : s);
                      update({ sections: JSON.stringify(arr) });
                    }} className="rounded" />
                    <span className="font-medium text-sm capitalize">{sec.type}</span>
                  </label>
                  {sec.type === "hero" && <span className="text-xs text-slate-400">Always first</span>}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-sm text-slate-900 mb-2">Featured Galleries</h3>
              <p className="text-xs text-slate-500 mb-3">Select galleries to showcase in your portfolio section.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {galleries.map(g => (
                  <button key={g.id} onClick={() => {
                    const ids = form.featuredGalleryIds || [];
                    update({ featuredGalleryIds: ids.includes(g.id) ? ids.filter(x => x !== g.id) : [...ids, g.id] });
                  }} className={`rounded-lg border-2 p-2 text-left transition ${(form.featuredGalleryIds || []).includes(g.id) ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                    {g.photos[0] && (
                      <div className="w-full h-20 bg-slate-100 rounded mb-1 overflow-hidden">
                        <img src={g.photos[0].s3Key_highRes} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="text-xs text-slate-600 truncate">{g.id.slice(0, 8)}... ({g.photos.length} photos)</div>
                  </button>
                ))}
                {galleries.length === 0 && <p className="col-span-4 text-sm text-slate-400">No galleries yet. Upload photos to feature them.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {tab === "services" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-900">Services</h2>
              <button onClick={async () => {
                const res = await fetch("/api/photographer/services", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: "New Service", description: "", startingAt: 0, sortOrder: services.length }),
                });
                const { service } = await res.json();
                if (service) setServices([...services, service]);
              }} className="px-3 py-1.5 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600">
                + Add Service
              </button>
            </div>
            <div className="space-y-3">
              {services.map((svc, i) => (
                <div key={svc.id} className="p-4 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex gap-3">
                    <input className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" value={svc.name} onChange={e => { const arr = [...services]; arr[i] = { ...arr[i], name: e.target.value }; setServices(arr); }} placeholder="Service name" />
                    <input className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm" type="number" value={svc.startingAt || ""} onChange={e => { const arr = [...services]; arr[i] = { ...arr[i], startingAt: parseFloat(e.target.value) || 0 }; setServices(arr); }} placeholder="Price" />
                    <button onClick={async () => {
                      await fetch("/api/photographer/services", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: svc.id }) });
                      setServices(services.filter(s => s.id !== svc.id));
                    }} className="px-2 text-red-400 hover:text-red-600 text-sm">Remove</button>
                  </div>
                  <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm h-16 resize-none" value={svc.description || ""} onChange={e => { const arr = [...services]; arr[i] = { ...arr[i], description: e.target.value }; setServices(arr); }} placeholder="Description..." />
                  <div className="flex gap-3">
                    <input className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={svc.duration || ""} onChange={e => { const arr = [...services]; arr[i] = { ...arr[i], duration: e.target.value }; setServices(arr); }} placeholder="Duration (e.g. 2 hours)" />
                    <button onClick={async () => {
                      await fetch("/api/photographer/services", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(svc),
                      });
                    }} className="px-3 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">Save</button>
                  </div>
                </div>
              ))}
              {services.length === 0 && <p className="text-sm text-slate-400">No services yet. Add your first service.</p>}
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {tab === "testimonials" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-900">Testimonials</h2>
              <button onClick={async () => {
                const res = await fetch("/api/photographer/testimonials", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ clientName: "Client Name", content: "Great experience!", sortOrder: testimonials.length }),
                });
                const { testimonial } = await res.json();
                if (testimonial) setTestimonials([...testimonials, testimonial]);
              }} className="px-3 py-1.5 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600">
                + Add Testimonial
              </button>
            </div>
            <div className="space-y-3">
              {testimonials.map((t, i) => (
                <div key={t.id} className="p-4 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex gap-3">
                    <input className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={t.clientName} onChange={e => { const arr = [...testimonials]; arr[i] = { ...arr[i], clientName: e.target.value }; setTestimonials(arr); }} placeholder="Client name" />
                    <input className="w-32 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={t.eventType || ""} onChange={e => { const arr = [...testimonials]; arr[i] = { ...arr[i], eventType: e.target.value }; setTestimonials(arr); }} placeholder="Event type" />
                    <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={t.rating} onChange={e => { const arr = [...testimonials]; arr[i] = { ...arr[i], rating: parseInt(e.target.value) }; setTestimonials(arr); }}>
                      {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{"★".repeat(r)}</option>)}
                    </select>
                  </div>
                  <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm h-16 resize-none" value={t.content} onChange={e => { const arr = [...testimonials]; arr[i] = { ...arr[i], content: e.target.value }; setTestimonials(arr); }} />
                  <div className="flex gap-2">
                    <button onClick={async () => {
                      await fetch("/api/photographer/testimonials", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(t),
                      });
                    }} className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">Save</button>
                    <button onClick={async () => {
                      await fetch("/api/photographer/testimonials", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: t.id }) });
                      setTestimonials(testimonials.filter(x => x.id !== t.id));
                    }} className="px-3 py-1.5 text-red-400 hover:text-red-600 text-sm">Remove</button>
                  </div>
                </div>
              ))}
              {testimonials.length === 0 && <p className="text-sm text-slate-400">No testimonials yet.</p>}
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {tab === "seo" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-bold text-lg text-slate-900">SEO Settings</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Page Title</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.seoTitle} onChange={e => update({ seoTitle: e.target.value })} placeholder={`${form.businessName} — Photography`} />
                <p className="text-xs text-slate-400 mt-1">Leave empty to auto-generate from business name</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm h-20 resize-none" value={form.seoDescription} onChange={e => update({ seoDescription: e.target.value })} placeholder="Professional photography services..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Social Share Image URL</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.seoImage} onChange={e => update({ seoImage: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-bold text-lg text-slate-900">Custom Domain</h2>
              <p className="text-sm text-slate-500">Point a CNAME record to <code className="bg-slate-100 px-1 rounded text-xs">sites.fotiqo.com</code></p>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.customDomain} onChange={e => update({ customDomain: e.target.value })} placeholder="www.yourname.com" />
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {tab === "preview" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-slate-400 text-center">
                fotiqo.com/p/{form.username || "your-name"}
              </div>
            </div>
            {form.username ? (
              <iframe src={`/p/${form.username}`} className="w-full h-[700px] border-0" />
            ) : (
              <div className="h-[500px] flex items-center justify-center text-slate-400">
                Set a username to preview your site
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
