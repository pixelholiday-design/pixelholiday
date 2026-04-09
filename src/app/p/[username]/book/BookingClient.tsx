"use client";

import { useState } from "react";

type Service = { id: string; name: string; description: string | null; startingAt: number | null; currency: string; duration: string | null };
type Profile = {
  id: string;
  username: string;
  businessName: string | null;
  primaryColor: string;
  websiteTheme: string;
  logoUrl: string | null;
  coverPhotoUrl: string | null;
  services: Service[];
};

export default function BookingClient({ profile }: { profile: Profile }) {
  const color = profile.primaryColor || "#29ABE2";
  const isDark = profile.websiteTheme === "dark" || profile.websiteTheme === "bold";
  const [form, setForm] = useState({ name: "", email: "", phone: "", eventType: "", eventDate: "", message: "", budget: "" });
  const [selectedService, setSelectedService] = useState("");
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Sending...");
    const res = await fetch("/api/photographer/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        profileId: profile.id,
        eventType: selectedService || form.eventType,
      }),
    });
    if (res.ok) {
      setStatus("Booking request sent! We'll be in touch within 24 hours.");
      setForm({ name: "", email: "", phone: "", eventType: "", eventDate: "", message: "", budget: "" });
      setSelectedService("");
    } else {
      setStatus("Something went wrong. Please try again.");
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-white text-gray-900"}`}>
      {/* Header */}
      <header className={`border-b ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-gray-100"}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href={`/p/${profile.username}`} className="flex items-center gap-2">
            {profile.logoUrl && <img src={profile.logoUrl} alt="" className="h-6 w-auto" />}
            <span className="font-bold">{profile.businessName || profile.username}</span>
          </a>
          <a href={`/p/${profile.username}`} className={`text-sm ${isDark ? "text-zinc-400" : "text-gray-500"} hover:opacity-80`}>&larr; Back to site</a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2 text-center">Book a Session</h1>
        <p className={`text-center mb-10 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>Choose a service and tell me about your project.</p>

        {profile.services.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {profile.services.map(svc => (
              <button key={svc.id} onClick={() => setSelectedService(svc.name)} className={`p-4 rounded-xl border-2 text-left transition ${selectedService === svc.name ? "border-current" : isDark ? "border-zinc-800 hover:border-zinc-700" : "border-gray-200 hover:border-gray-300"}`} style={selectedService === svc.name ? { borderColor: color } : undefined}>
                <div className="font-semibold text-sm">{svc.name}</div>
                {svc.startingAt != null && svc.startingAt > 0 && (
                  <div className="text-xs mt-1" style={{ color }}>From {svc.currency === "EUR" ? "€" : "$"}{svc.startingAt}</div>
                )}
                {svc.duration && <div className={`text-xs ${isDark ? "text-zinc-500" : "text-gray-400"}`}>{svc.duration}</div>}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Your Name" className={`w-full rounded-lg border px-4 py-3 text-sm ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"}`} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input required type="email" placeholder="Email" className={`w-full rounded-lg border px-4 py-3 text-sm ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"}`} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input placeholder="Phone" className={`w-full rounded-lg border px-4 py-3 text-sm ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"}`} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <input type="date" className={`w-full rounded-lg border px-4 py-3 text-sm ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"}`} value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} />
          </div>
          <input placeholder="Budget (optional)" className={`w-full rounded-lg border px-4 py-3 text-sm ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"}`} value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
          <textarea required placeholder="Tell me about your event or project..." className={`w-full rounded-lg border px-4 py-3 text-sm h-32 resize-y ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"}`} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          <button type="submit" className="w-full py-3 rounded-lg text-white font-semibold" style={{ backgroundColor: color }}>
            Send Booking Request
          </button>
          {status && <p className={`text-center text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>{status}</p>}
        </form>
      </div>
    </div>
  );
}
