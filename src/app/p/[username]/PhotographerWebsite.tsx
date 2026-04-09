"use client";

import { useState } from "react";
import type { SectionConfig, WebsiteTheme } from "@/lib/website-themes";
import { DEFAULT_SECTIONS } from "@/lib/website-themes";
import { photoRef } from "@/lib/cloudinary";

type Profile = {
  id: string;
  username: string;
  businessName: string | null;
  tagline: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  coverPhotoUrl: string | null;
  specialties: string[];
  experience: string | null;
  equipment: string[];
  languages: string[];
  city: string | null;
  country: string | null;
  priceRange: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialWebsite: string | null;
  socialTiktok: string | null;
  websiteTheme: string;
  primaryColor: string;
  fontChoice: string;
  logoUrl: string | null;
  sections: string | null;
  services: { id: string; name: string; description: string | null; startingAt: number | null; currency: string; duration: string | null }[];
  testimonials: { id: string; clientName: string; content: string; rating: number; eventType: string | null }[];
  user: { name: string; email: string };
};

type Gallery = { id: string; magicLinkToken: string; photos: { id: string; s3Key_highRes: string; cloudinaryId: string | null }[] };

function getThemeClasses(theme: WebsiteTheme) {
  const themes: Record<WebsiteTheme, { bg: string; text: string; accent: string; card: string; heroBg: string; muted: string }> = {
    minimal: { bg: "bg-white", text: "text-gray-900", accent: "text-gray-600", card: "bg-gray-50", heroBg: "bg-white", muted: "text-gray-500" },
    bold: { bg: "bg-black", text: "text-white", accent: "text-gray-300", card: "bg-zinc-900", heroBg: "bg-black", muted: "text-gray-400" },
    classic: { bg: "bg-amber-50", text: "text-amber-950", accent: "text-amber-700", card: "bg-white", heroBg: "bg-amber-100", muted: "text-amber-600" },
    modern: { bg: "bg-slate-50", text: "text-slate-900", accent: "text-slate-600", card: "bg-white", heroBg: "bg-gradient-to-br from-slate-100 to-slate-200", muted: "text-slate-500" },
    dark: { bg: "bg-zinc-950", text: "text-zinc-100", accent: "text-zinc-400", card: "bg-zinc-900", heroBg: "bg-zinc-950", muted: "text-zinc-500" },
    light: { bg: "bg-rose-50", text: "text-rose-950", accent: "text-rose-600", card: "bg-white", heroBg: "bg-gradient-to-br from-rose-50 to-pink-50", muted: "text-rose-400" },
  };
  return themes[theme] || themes.minimal;
}

export default function PhotographerWebsite({ profile, galleries }: { profile: Profile; galleries: Gallery[] }) {
  const theme = (profile.websiteTheme || "minimal") as WebsiteTheme;
  const tc = getThemeClasses(theme);
  const sections: SectionConfig[] = (() => {
    try {
      const parsed = JSON.parse(profile.sections || "[]");
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SECTIONS;
    } catch { return DEFAULT_SECTIONS; }
  })();
  const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
  const allPhotos = galleries.flatMap(g => g.photos);
  const primaryColor = profile.primaryColor || "#29ABE2";

  return (
    <div className={`min-h-screen ${tc.bg} ${tc.text}`} style={{ "--photographer-primary": primaryColor } as any}>
      {/* Navigation */}
      <nav className={`${tc.bg} border-b border-opacity-10 sticky top-0 z-40`} style={{ borderColor: `${primaryColor}30` }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {profile.logoUrl && <img src={profile.logoUrl} alt="" className="h-8 w-auto" />}
            <span className="font-bold text-lg">{profile.businessName || profile.user.name}</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {visibleSections.map(s => (
              <a key={s.type} href={`#${s.type}`} className={`${tc.accent} hover:opacity-80 capitalize`}>{s.type}</a>
            ))}
            <a href={`/p/${profile.username}/book`} className="px-4 py-2 rounded-full text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
              Book Now
            </a>
          </div>
        </div>
      </nav>

      {visibleSections.map(sec => {
        switch (sec.type) {
          case "hero": return <HeroSection key="hero" profile={profile} tc={tc} primaryColor={primaryColor} />;
          case "portfolio": return <PortfolioSection key="portfolio" photos={allPhotos} tc={tc} username={profile.username} galleries={galleries} />;
          case "about": return <AboutSection key="about" profile={profile} tc={tc} />;
          case "services": return <ServicesSection key="services" services={profile.services} tc={tc} primaryColor={primaryColor} />;
          case "testimonials": return <TestimonialsSection key="testimonials" testimonials={profile.testimonials} tc={tc} primaryColor={primaryColor} />;
          case "contact": return <ContactSection key="contact" profile={profile} tc={tc} primaryColor={primaryColor} />;
          case "blog": return (
            <section key="blog" id="blog" className="py-20">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">Blog</h2>
                <p className={`${tc.muted} mb-6`}>Stories, tips, and behind the scenes.</p>
                <a href={`/p/${profile.username}/blog`} className="inline-block px-6 py-2 rounded-full text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
                  Read the Blog
                </a>
              </div>
            </section>
          );
          default: return null;
        }
      })}

      {/* Footer */}
      <footer className={`${tc.card} py-8 border-t border-opacity-10`} style={{ borderColor: `${primaryColor}20` }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 mb-4">
            {profile.socialInstagram && <a href={profile.socialInstagram} target="_blank" className={`${tc.muted} hover:opacity-80 text-sm`}>Instagram</a>}
            {profile.socialFacebook && <a href={profile.socialFacebook} target="_blank" className={`${tc.muted} hover:opacity-80 text-sm`}>Facebook</a>}
            {profile.socialTiktok && <a href={profile.socialTiktok} target="_blank" className={`${tc.muted} hover:opacity-80 text-sm`}>TikTok</a>}
            {profile.socialWebsite && <a href={profile.socialWebsite} target="_blank" className={`${tc.muted} hover:opacity-80 text-sm`}>Website</a>}
          </div>
          <p className={`text-xs ${tc.muted}`}>&copy; {new Date().getFullYear()} {profile.businessName || profile.user.name}. Powered by Pixelvo.</p>
        </div>
      </footer>
    </div>
  );
}

function HeroSection({ profile, tc, primaryColor }: { profile: Profile; tc: any; primaryColor: string }) {
  return (
    <section id="hero" className={`relative ${tc.heroBg} overflow-hidden`}>
      {profile.coverPhotoUrl && (
        <div className="absolute inset-0">
          <img src={profile.coverPhotoUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      <div className={`relative max-w-6xl mx-auto px-4 py-32 text-center ${profile.coverPhotoUrl ? "text-white" : ""}`}>
        {profile.profilePhotoUrl && (
          <img src={profile.profilePhotoUrl} alt={profile.businessName || ""} className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4 border-white/30" />
        )}
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{profile.businessName || profile.user.name}</h1>
        {profile.tagline && <p className="text-xl md:text-2xl opacity-80 mb-6">{profile.tagline}</p>}
        {(profile.city || profile.country) && (
          <p className="text-sm opacity-60 mb-8">{[profile.city, profile.country].filter(Boolean).join(", ")}</p>
        )}
        <a href={`/p/${profile.username}/book`} className="inline-block px-8 py-3 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition" style={{ backgroundColor: primaryColor }}>
          Book a Session
        </a>
      </div>
    </section>
  );
}

function PortfolioSection({ photos, tc, username, galleries }: { photos: any[]; tc: any; username: string; galleries: Gallery[] }) {
  if (photos.length === 0) return null;
  return (
    <section id="portfolio" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Portfolio</h2>
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {photos.slice(0, 12).map(p => (
            <div key={p.id} className="break-inside-avoid rounded-lg overflow-hidden">
              <img src={photoRef(p)} alt="" className="w-full h-auto" loading="lazy" />
            </div>
          ))}
        </div>
        {galleries.length > 0 && (
          <div className="text-center mt-8">
            <a href={`/p/${username}/gallery/${galleries[0].magicLinkToken}`} className={`${tc.accent} text-sm hover:opacity-80`}>
              View Full Gallery &rarr;
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function AboutSection({ profile, tc }: { profile: Profile; tc: any }) {
  return (
    <section id="about" className={`py-20 ${tc.card}`}>
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">About</h2>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            {profile.profilePhotoUrl && (
              <img src={profile.profilePhotoUrl} alt="" className="w-full max-w-sm mx-auto rounded-xl" />
            )}
          </div>
          <div className="space-y-4">
            {profile.bio && <p className={`${tc.accent} leading-relaxed whitespace-pre-line`}>{profile.bio}</p>}
            {profile.experience && (
              <div>
                <span className="font-semibold text-sm">Experience:</span>{" "}
                <span className={`${tc.muted} text-sm`}>{profile.experience}</span>
              </div>
            )}
            {profile.specialties.length > 0 && (
              <div>
                <span className="font-semibold text-sm block mb-2">Specialties:</span>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map(s => (
                    <span key={s} className={`px-3 py-1 rounded-full text-xs font-medium ${tc.bg} border border-current/10 capitalize`}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.equipment.length > 0 && (
              <div>
                <span className="font-semibold text-sm block mb-2">Equipment:</span>
                <div className="flex flex-wrap gap-2">
                  {profile.equipment.map(e => (
                    <span key={e} className={`px-2 py-1 text-xs ${tc.muted}`}>{e}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.languages.length > 0 && (
              <div>
                <span className="font-semibold text-sm">Languages: </span>
                <span className={`${tc.muted} text-sm`}>{profile.languages.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ services, tc, primaryColor }: { services: Profile["services"]; tc: any; primaryColor: string }) {
  if (services.length === 0) return null;
  return (
    <section id="services" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(svc => (
            <div key={svc.id} className={`${tc.card} rounded-xl p-6 border border-opacity-10`} style={{ borderColor: `${primaryColor}20` }}>
              <h3 className="font-bold text-lg mb-2">{svc.name}</h3>
              {svc.description && <p className={`${tc.muted} text-sm mb-4`}>{svc.description}</p>}
              <div className="flex items-end justify-between mt-auto">
                {svc.startingAt != null && svc.startingAt > 0 && (
                  <div>
                    <span className="text-xs uppercase tracking-wide" style={{ color: primaryColor }}>Starting at</span>
                    <div className="text-2xl font-bold">{svc.currency === "EUR" ? "€" : "$"}{svc.startingAt}</div>
                  </div>
                )}
                {svc.duration && <span className={`text-xs ${tc.muted}`}>{svc.duration}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ testimonials, tc, primaryColor }: { testimonials: Profile["testimonials"]; tc: any; primaryColor: string }) {
  if (testimonials.length === 0) return null;
  return (
    <section id="testimonials" className={`py-20 ${tc.card}`}>
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Clients Say</h2>
        <div className="space-y-6">
          {testimonials.map(t => (
            <div key={t.id} className={`${tc.bg} rounded-xl p-6`}>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} style={{ color: primaryColor }}>&#9733;</span>
                ))}
              </div>
              <blockquote className={`${tc.accent} mb-4 italic leading-relaxed`}>&ldquo;{t.content}&rdquo;</blockquote>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{t.clientName}</span>
                {t.eventType && <span className={`text-xs ${tc.muted}`}>&middot; {t.eventType}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ profile, tc, primaryColor }: { profile: Profile; tc: any; primaryColor: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", eventType: "", eventDate: "", message: "", budget: "" });
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Sending...");
    const res = await fetch("/api/photographer/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, profileId: profile.id }),
    });
    if (res.ok) {
      setStatus("Message sent! We'll be in touch soon.");
      setForm({ name: "", email: "", phone: "", eventType: "", eventDate: "", message: "", budget: "" });
    } else {
      setStatus("Something went wrong. Please try again.");
    }
  }

  return (
    <section id="contact" className="py-20">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Get in Touch</h2>
        <p className={`text-center ${tc.muted} mb-10`}>Interested in working together? Send me a message.</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input required className={`w-full ${tc.card} border border-opacity-10 rounded-lg px-4 py-3 text-sm`} style={{ borderColor: `${primaryColor}20` }} placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input required type="email" className={`w-full ${tc.card} border border-opacity-10 rounded-lg px-4 py-3 text-sm`} style={{ borderColor: `${primaryColor}20` }} placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input className={`w-full ${tc.card} border border-opacity-10 rounded-lg px-4 py-3 text-sm`} style={{ borderColor: `${primaryColor}20` }} placeholder="Phone (optional)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <input className={`w-full ${tc.card} border border-opacity-10 rounded-lg px-4 py-3 text-sm`} style={{ borderColor: `${primaryColor}20` }} placeholder="Event Type (e.g. Wedding)" value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input type="date" className={`w-full ${tc.card} border border-opacity-10 rounded-lg px-4 py-3 text-sm`} style={{ borderColor: `${primaryColor}20` }} value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} />
            <input className={`w-full ${tc.card} border border-opacity-10 rounded-lg px-4 py-3 text-sm`} style={{ borderColor: `${primaryColor}20` }} placeholder="Budget (optional)" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
          </div>
          <textarea required className={`w-full ${tc.card} border border-opacity-10 rounded-lg px-4 py-3 text-sm h-32 resize-y`} style={{ borderColor: `${primaryColor}20` }} placeholder="Tell me about your project..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          <button type="submit" className="w-full py-3 rounded-lg text-white font-semibold" style={{ backgroundColor: primaryColor }}>
            Send Message
          </button>
          {status && <p className={`text-sm text-center ${tc.muted}`}>{status}</p>}
        </form>
      </div>
    </section>
  );
}
