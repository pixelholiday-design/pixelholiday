"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Building, Camera, Users, BarChart3, Globe, Zap, Shield, Loader2, Send, Mail, Phone, MapPin } from "lucide-react";

const VENUE_TYPES = [
  "Hotel / Resort", "Water Park", "Zoo / Aquarium", "Theme Park", "Safari Lodge",
  "Ski Resort", "Cruise Ship", "Carnival / Festival", "Wedding Venue", "Corporate Events",
  "Beach Club", "Botanical Garden", "Sports Event", "Amusement Park", "Museum", "Other",
];

const FEATURES = [
  "Kiosk POS (cash + card)", "Gallery delivery (WhatsApp + QR)", "Face recognition",
  "Staff scheduling", "AI gamification", "Cash register management",
  "Real-time streaming", "Analytics dashboard", "Multi-language (10 languages)",
  "Hotel check-in API", "Sleeping money recovery", "Fotiqo Academy training",
  "Photographer coaching", "Equipment tracking", "Unlimited locations",
  "Unlimited staff", "Shift management", "Commission tracking",
];

export default function AttractionsPage() {
  const [form, setForm] = useState({ companyName: "", contactName: "", email: "", phone: "", venueType: "", venueCount: "", country: "", city: "", estimatedRevenue: "", currentSetup: "", websiteUrl: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/venue-applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.ok) setSubmitted(true);
      else setError(data.error || "Something went wrong. Please try again.");
    } catch { setError("Network error. Please try again."); }
    setSubmitting(false);
  }

  return (
    <div className="pt-24">
      {/* HERO */}
      <section className="text-center px-6 pb-16">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
          <Zap className="h-3.5 w-3.5" /> Zero monthly fees. Zero risk.
        </div>
        <h1 className="font-display text-5xl sm:text-6xl text-navy-900 leading-[1.1] mb-4 text-balance">
          Better photography.<br />Zero cost to you.
        </h1>
        <p className="text-lg text-navy-500 max-w-2xl mx-auto mb-8">
          The complete photography platform for hotels, water parks, zoos, theme parks, and every attraction in between.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#apply" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-4 text-base shadow-lift transition hover:scale-[1.02]">Apply to join <ArrowRight className="h-4 w-4" /></a>
          <a href="#how" className="inline-flex items-center gap-2 text-navy-600 hover:text-brand-500 font-medium px-6 py-4 transition">See how it works</a>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl text-navy-900 text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Apply", desc: "Fill out a short form. We review in 1\–3 days." },
              { step: "2", title: "Demo", desc: "15-minute call to show you the platform." },
              { step: "3", title: "Setup", desc: "We configure your venues, staff, and kiosks." },
              { step: "4", title: "Earn", desc: "Photographers take photos. Guests buy. You get paid." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="h-12 w-12 rounded-full bg-brand-100 text-brand-600 font-display text-xl flex items-center justify-center mx-auto mb-3">{s.step}</div>
                <h3 className="font-display text-lg text-navy-900 mb-1">{s.title}</h3>
                <p className="text-sm text-navy-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMISSION */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-3xl text-navy-900 text-center mb-3">You keep 95-98% of every photo sale</h2>
          <p className="text-navy-500 text-center mb-10">No monthly fees. No setup costs. We only earn when you earn.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white rounded-2xl shadow-card overflow-hidden">
              <thead><tr className="bg-cream-50 border-b border-cream-200"><th className="py-4 px-6 text-left text-navy-500 font-medium">Monthly photo revenue</th><th className="py-4 px-6 text-center text-navy-500 font-medium">You keep</th><th className="py-4 px-6 text-center text-navy-500 font-medium">Platform fee</th></tr></thead>
              <tbody>
                {[["Up to €5,000", "95%", "5%"], ["€5,000   — €15,000", "96%", "4%"], ["€15,000   — €50,000", "97%", "3%"], ["Over €50,000", "98%", "2%"]].map(([rev, keep, fee]) => (
                  <tr key={rev} className="border-b border-cream-100"><td className="py-4 px-6 text-navy-700">{rev}</td><td className="py-4 px-6 text-center font-display text-green-600 text-lg">{keep}</td><td className="py-4 px-6 text-center text-navy-400">{fee}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-navy-500 mt-4">The more you grow, the more you keep.</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl text-navy-900 text-center mb-10">Everything included</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 bg-cream-50 rounded-xl px-4 py-3"><Check className="h-4 w-4 text-brand-500 flex-shrink-0" /><span className="text-sm text-navy-700">{f}</span></div>
            ))}
          </div>
          <p className="text-center text-sm text-navy-400 mt-6">All included. No extra charges. No hidden fees.</p>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section id="apply" className="py-16 bg-cream-50">
        <div className="max-w-2xl mx-auto px-6">
          {submitted ? (
            <div className="text-center py-12 animate-slide-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"><Check className="h-8 w-8 text-green-600" /></div>
              <h2 className="font-display text-3xl text-navy-900 mb-2">Application received!</h2>
              <p className="text-navy-500">Our team will review your application and contact you within 1\–3 business days.</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl text-navy-900 text-center mb-2">Apply to join Fotiqo</h2>
              <p className="text-navy-500 text-center mb-8">Tell us about your business. We'll get back to you within 1\–3 business days.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="label-xs block mb-1">Company name *</label><input className="input" required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>
                  <div><label className="label-xs block mb-1">Your name *</label><input className="input" required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></div>
                  <div><label className="label-xs block mb-1">Email *</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div><label className="label-xs block mb-1">Phone *</label><input className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><label className="label-xs block mb-1">Venue type *</label><select className="input" required value={form.venueType} onChange={(e) => setForm({ ...form, venueType: e.target.value })}><option value="">Select...</option>{VENUE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}</select></div>
                  <div><label className="label-xs block mb-1">Number of locations *</label><select className="input" required value={form.venueCount} onChange={(e) => setForm({ ...form, venueCount: e.target.value })}><option value="">Select...</option><option>1</option><option>2-5</option><option>6-20</option><option>20+</option></select></div>
                  <div><label className="label-xs block mb-1">Country *</label><input className="input" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
                  <div><label className="label-xs block mb-1">City</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                  <div><label className="label-xs block mb-1">Estimated monthly revenue</label><select className="input" value={form.estimatedRevenue} onChange={(e) => setForm({ ...form, estimatedRevenue: e.target.value })}><option value="">Select...</option><option>Under €5,000</option><option>€5,000\–€15,000</option><option>€15,000\–€50,000</option><option>Over €50,000</option><option>Not sure yet</option></select></div>
                  <div><label className="label-xs block mb-1">Current setup</label><select className="input" value={form.currentSetup} onChange={(e) => setForm({ ...form, currentSetup: e.target.value })}><option value="">Select...</option><option>Own photography team</option><option>Outsourced</option><option>Starting fresh</option><option>Mixed</option></select></div>
                </div>
                <div><label className="label-xs block mb-1">Website URL</label><input className="input" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://" /></div>
                <div><label className="label-xs block mb-1">Message</label><textarea className="input !h-24" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more about your photography needs..." /></div>
                {error && <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-2.5 text-sm text-coral-700">{error}</div>}
                <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-4 text-base transition disabled:opacity-60">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Application</>}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
