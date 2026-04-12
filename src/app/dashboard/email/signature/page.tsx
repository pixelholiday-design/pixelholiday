"use client";
import { useState, useEffect } from "react";
import { Loader2, Copy, Check, Mail, Image, User, Building2, Save, ExternalLink } from "lucide-react";

type SignatureStyle = "MINIMAL" | "WITH_LOGO" | "WITH_PHOTO" | "COMPANY_BRANDED";

type SignatureData = {
  style: SignatureStyle;
  displayName: string;
  title: string;
  phone: string;
  email: string;
  websiteUrl: string;
  bookingUrl: string;
  location: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  tiktok: string;
  logoUrl: string;
  photoUrl: string;
  brandColor: string;
  showPoweredBy: boolean;
  company: string;
};

const DEFAULT_DATA: SignatureData = {
  style: "MINIMAL",
  displayName: "",
  title: "",
  phone: "",
  email: "",
  websiteUrl: "",
  bookingUrl: "",
  location: "",
  instagram: "",
  facebook: "",
  linkedin: "",
  tiktok: "",
  logoUrl: "",
  photoUrl: "",
  brandColor: "#0EA5A5",
  showPoweredBy: true,
  company: "",
};

const STYLE_OPTIONS: { key: SignatureStyle; label: string; desc: string }[] = [
  { key: "MINIMAL", label: "Minimal", desc: "Name and contact info" },
  { key: "WITH_LOGO", label: "With Logo", desc: "Logo beside your info" },
  { key: "WITH_PHOTO", label: "With Photo", desc: "Your headshot included" },
  { key: "COMPANY_BRANDED", label: "Company Branded", desc: "Full branded layout" },
];

function styleIcon(style: SignatureStyle) {
  switch (style) {
    case "MINIMAL": return <Mail className="w-5 h-5" />;
    case "WITH_LOGO": return <Building2 className="w-5 h-5" />;
    case "WITH_PHOTO": return <User className="w-5 h-5" />;
    case "COMPANY_BRANDED": return <Image className="w-5 h-5" />;
  }
}

function generateSignatureHtml(data: SignatureData): string {
  const { style, displayName, title, phone, email, websiteUrl, bookingUrl, location, instagram, facebook, linkedin, tiktok, logoUrl, photoUrl, brandColor, showPoweredBy, company } = data;

  const socialLinks: string[] = [];
  if (instagram) socialLinks.push(`<a href="https://instagram.com/${instagram}" style="color:${brandColor};text-decoration:none;">Instagram</a>`);
  if (facebook) socialLinks.push(`<a href="https://facebook.com/${facebook}" style="color:${brandColor};text-decoration:none;">Facebook</a>`);
  if (linkedin) socialLinks.push(`<a href="https://linkedin.com/in/${linkedin}" style="color:${brandColor};text-decoration:none;">LinkedIn</a>`);
  if (tiktok) socialLinks.push(`<a href="https://tiktok.com/@${tiktok}" style="color:${brandColor};text-decoration:none;">TikTok</a>`);
  const socialRow = socialLinks.length > 0 ? `<tr><td style="padding-top:6px;font-size:11px;">${socialLinks.join(" &middot; ")}</td></tr>` : "";

  const poweredByRow = showPoweredBy ? `<tr><td style="padding-top:8px;font-size:11px;color:#999999;">Powered by <a href="https://fotiqo.com" style="color:${brandColor};text-decoration:none;">Fotiqo</a></td></tr>` : "";

  const linksRow = (websiteUrl || bookingUrl) ? `<tr><td style="padding-top:4px;font-size:12px;">${websiteUrl ? `<a href="${websiteUrl}" style="color:${brandColor};text-decoration:none;">Website</a>` : ""}${websiteUrl && bookingUrl ? " &middot; " : ""}${bookingUrl ? `<a href="${bookingUrl}" style="color:${brandColor};text-decoration:none;">Book a Session</a>` : ""}</td></tr>` : "";

  const titleRow = title ? `<tr><td style="color:#555555;font-size:13px;">${title}</td></tr>` : "";
  const companyRow = company ? `<tr><td style="color:#555555;font-size:13px;">${company}</td></tr>` : "";
  const phoneRow = phone ? `<tr><td style="color:#666666;font-size:12px;">${phone}</td></tr>` : "";
  const locationRow = location ? `<tr><td style="color:#888888;font-size:12px;">${location}</td></tr>` : "";
  const emailRow = email ? `<tr><td style="color:#666666;font-size:12px;"><a href="mailto:${email}" style="color:${brandColor};text-decoration:none;">${email}</a></td></tr>` : "";

  if (style === "MINIMAL") {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#333333;line-height:1.5;">
  <tr><td style="padding-bottom:4px;font-weight:bold;font-size:15px;color:${brandColor};">${displayName || "Your Name"}</td></tr>
  ${titleRow}${companyRow}${emailRow}${phoneRow}${locationRow}${linksRow}${socialRow}${poweredByRow}
</table>`;
  }

  if (style === "WITH_LOGO") {
    const logoCell = logoUrl
      ? `<td style="padding-right:14px;vertical-align:top;"><img src="${logoUrl}" alt="Logo" style="width:60px;height:60px;border-radius:8px;object-fit:contain;" /></td>`
      : `<td style="padding-right:14px;vertical-align:top;"><div style="width:60px;height:60px;border-radius:8px;background:${brandColor}15;display:flex;align-items:center;justify-content:center;font-size:24px;color:${brandColor};font-weight:bold;">${(displayName || "F")[0]?.toUpperCase()}</div></td>`;
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#333333;line-height:1.5;">
  <tr>
    ${logoCell}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding-bottom:4px;font-weight:bold;font-size:15px;color:${brandColor};">${displayName || "Your Name"}</td></tr>
        ${titleRow}${companyRow}${emailRow}${phoneRow}${locationRow}${linksRow}${socialRow}${poweredByRow}
      </table>
    </td>
  </tr>
</table>`;
  }

  if (style === "WITH_PHOTO") {
    const photoCell = photoUrl
      ? `<td style="padding-right:14px;vertical-align:top;"><img src="${photoUrl}" alt="Photo" style="width:70px;height:70px;border-radius:50%;object-fit:cover;" /></td>`
      : `<td style="padding-right:14px;vertical-align:top;"><div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,${brandColor},${brandColor}88);display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:bold;">${(displayName || "F")[0]?.toUpperCase()}</div></td>`;
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#333333;line-height:1.5;">
  <tr>
    ${photoCell}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding-bottom:4px;font-weight:bold;font-size:15px;color:${brandColor};">${displayName || "Your Name"}</td></tr>
        ${titleRow}${companyRow}${emailRow}${phoneRow}${locationRow}${linksRow}${socialRow}${poweredByRow}
      </table>
    </td>
  </tr>
</table>`;
  }

  // COMPANY_BRANDED
  const headerBar = `<tr><td style="background:${brandColor};padding:10px 14px;border-radius:6px 6px 0 0;">
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr>
      ${logoUrl ? `<td style="width:36px;"><img src="${logoUrl}" alt="" style="width:32px;height:32px;border-radius:4px;" /></td>` : ""}
      <td style="color:#ffffff;font-weight:bold;font-size:14px;">${company || "Company"}</td>
    </tr></table>
  </td></tr>`;

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#333333;line-height:1.5;border:1px solid #e5e5e5;border-radius:6px;overflow:hidden;max-width:400px;">
  ${headerBar}
  <tr><td style="padding:12px 14px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding-bottom:4px;font-weight:bold;font-size:15px;color:${brandColor};">${displayName || "Your Name"}</td></tr>
      ${titleRow}${emailRow}${phoneRow}${locationRow}${linksRow}${socialRow}${poweredByRow}
    </table>
  </td></tr>
</table>`;
}

export default function EmailSignaturePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [data, setData] = useState<SignatureData>({ ...DEFAULT_DATA });
  const [previewHtml, setPreviewHtml] = useState("");

  const brandColor = data.brandColor || "#0EA5A5";

  useEffect(() => {
    async function loadExisting() {
      try {
        const res = await fetch("/api/email/inbox?folder=INBOX&limit=1");
        if (res.ok) {
          const inbox = await res.json();
          if (inbox.emailAddress) {
            setData((prev) => ({ ...prev, email: inbox.emailAddress }));
          }
        }
      } catch {
        /* ignore */
      }

      try {
        const res = await fetch("/api/email/generate-signature");
        if (res.ok) {
          const sig = await res.json();
          if (sig) {
            setData((prev) => ({
              ...prev,
              displayName: sig.displayName || prev.displayName,
              title: sig.title || "",
              phone: sig.phone || "",
              email: sig.email || prev.email,
              websiteUrl: sig.websiteUrl || "",
              bookingUrl: sig.bookingUrl || "",
              location: sig.location || "",
              instagram: sig.instagram || "",
              facebook: sig.facebook || "",
              linkedin: sig.linkedin || "",
              tiktok: sig.tiktok || "",
              logoUrl: sig.logoUrl || "",
              photoUrl: sig.photoUrl || "",
              brandColor: sig.brandColor || prev.brandColor,
              showPoweredBy: sig.showPoweredBy !== false,
              company: sig.company || "",
              style: sig.style || prev.style,
            }));
          }
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    loadExisting();
  }, []);

  // Live preview with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewHtml(generateSignatureHtml(data));
    }, 200);
    return () => clearTimeout(timer);
  }, [data]);

  function updateField<K extends keyof SignatureData>(key: K, value: SignatureData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const html = generateSignatureHtml(data);
      await fetch("/api/email/generate-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, signatureHtml: html }),
      });
    } catch {
      alert("Failed to save signature");
    } finally {
      setSaving(false);
    }
  }

  async function copyToClipboard(type: string) {
    const html = generateSignatureHtml(data);
    try {
      if (type === "html") {
        await navigator.clipboard.writeText(html);
      } else {
        const blob = new Blob([html], { type: "text/html" });
        await navigator.clipboard.write([
          new ClipboardItem({ "text/html": blob, "text/plain": new Blob([html], { type: "text/plain" }) }),
        ]);
      }
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
      await navigator.clipboard.writeText(html);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColor }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 md:px-8 py-4">
        <p className="text-xs text-gray-400 mb-1">
          <a href="/dashboard/email" className="hover:text-gray-600">Email</a>
          <span className="mx-1.5">&gt;</span>
          <span className="text-gray-600">Signature</span>
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Email Signature</h1>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Form */}
          <div className="space-y-6">
            {/* Style Selector */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Signature Style</h2>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_OPTIONS.map((opt) => {
                  const isActive = data.style === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => updateField("style", opt.key)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition text-center ${
                        isActive ? "bg-white shadow-sm" : "bg-gray-50 border-transparent hover:border-gray-200"
                      }`}
                      style={isActive ? { borderColor: brandColor } : undefined}
                    >
                      <div className={`${isActive ? "" : "text-gray-400"}`} style={isActive ? { color: brandColor } : undefined}>
                        {styleIcon(opt.key)}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-600"}`}>{opt.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Display Name</label>
                  <input type="text" value={data.displayName} onChange={(e) => updateField("displayName", e.target.value)} placeholder="John Smith" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Title / Role</label>
                  <input type="text" value={data.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Photographer" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
                  <input type="text" value={data.company} onChange={(e) => updateField("company", e.target.value)} placeholder="Fotiqo Studio" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  <input type="tel" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+1 555 0123" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <input type="email" value={data.email} onChange={(e) => updateField("email", e.target.value)} placeholder="you@fotiqo.com" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Website URL</label>
                  <input type="url" value={data.websiteUrl} onChange={(e) => updateField("websiteUrl", e.target.value)} placeholder="https://yoursite.com" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Booking URL</label>
                  <input type="url" value={data.bookingUrl} onChange={(e) => updateField("bookingUrl", e.target.value)} placeholder="https://book.fotiqo.com/you" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                  <input type="text" value={data.location} onChange={(e) => updateField("location", e.target.value)} placeholder="Monastir, Tunisia" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">Social Media</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Instagram</label>
                  <input type="text" value={data.instagram} onChange={(e) => updateField("instagram", e.target.value)} placeholder="username" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Facebook</label>
                  <input type="text" value={data.facebook} onChange={(e) => updateField("facebook", e.target.value)} placeholder="page-name" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn</label>
                  <input type="text" value={data.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} placeholder="username" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">TikTok</label>
                  <input type="text" value={data.tiktok} onChange={(e) => updateField("tiktok", e.target.value)} placeholder="username" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
              </div>
            </div>

            {/* Branding & Media */}
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">Branding & Media</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Logo URL</label>
                  <input type="url" value={data.logoUrl} onChange={(e) => updateField("logoUrl", e.target.value)} placeholder="https://example.com/logo.png" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Photo URL</label>
                  <input type="url" value={data.photoUrl} onChange={(e) => updateField("photoUrl", e.target.value)} placeholder="https://example.com/headshot.jpg" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={data.brandColor} onChange={(e) => updateField("brandColor", e.target.value)} className="w-10 h-10 rounded-lg border cursor-pointer" />
                    <input type="text" value={data.brandColor} onChange={(e) => updateField("brandColor", e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2" style={{ "--tw-ring-color": brandColor } as any} />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={data.showPoweredBy} onChange={(e) => updateField("showPoweredBy", e.target.checked)} className="rounded border-gray-300" />
                  <span className="text-sm text-gray-600">Show &quot;Powered by Fotiqo&quot;</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: brandColor }}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving..." : "Save Signature"}
            </button>
          </div>

          {/* Right Column: Preview & Copy */}
          <div className="space-y-6">
            {/* Live Preview */}
            <div className="bg-white rounded-xl border p-5 sticky top-20">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Live Preview</h2>
              <div className="border rounded-lg p-6 bg-gray-50 min-h-[160px]">
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>

              {/* Copy Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => copyToClipboard("html")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-gray-50 transition"
                  style={{ borderColor: brandColor, color: brandColor }}
                >
                  {copied === "html" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === "html" ? "Copied!" : "Copy Signature HTML"}
                </button>
                <button
                  onClick={() => copyToClipboard("rich")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition"
                  style={{ backgroundColor: brandColor }}
                >
                  {copied === "rich" ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  {copied === "rich" ? "Copied!" : "Copy for Gmail/Outlook"}
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">How to add to Gmail:</h3>
                  <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                    <li>Click &quot;Copy Signature HTML&quot; above</li>
                    <li>Go to Gmail Settings &gt; See all settings &gt; General &gt; Signature</li>
                    <li>Create a new signature, paste the HTML code, and save</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">How to add to Outlook:</h3>
                  <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                    <li>Click &quot;Copy for Gmail/Outlook&quot; above</li>
                    <li>Go to Outlook Settings &gt; Mail &gt; Compose and reply &gt; Email signature</li>
                    <li>Paste directly into the signature editor and save</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
