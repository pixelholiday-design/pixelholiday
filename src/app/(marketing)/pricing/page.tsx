"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Minus, ChevronDown, ChevronUp } from "lucide-react";

const PLANS = [
  {
    name: "Starter", badge: "Free forever", monthly: 0, annual: 0, desc: "Perfect for getting started", highlighted: false,
    features: ["3 active galleries (unlimited photos each)", "Portfolio website (fotiqo.com/p/you)", "3 booking packages", "Marketplace listing", "Basic client CRM", "6 gallery themes", "Auto language detection (10 languages)", "Per-photo purchasing + digital pass", "Photo book designer for clients", "Help center (100+ articles)", "1GB storage", "Fotiqo branding on galleries", "Store with 10% margin commission"],
    cta: "Get started free", ctaStyle: "outline",
  },
  {
    name: "Pro", badge: "Best value", monthly: 19, annual: 15, desc: "Everything you need to grow", highlighted: true,
    features: ["Everything in Starter, plus:", "Unlimited galleries", "Custom domain (yourname.com)", "Remove Fotiqo branding", "Unlimited booking packages", "Contracts + e-signatures (5 templates)", "Invoices with Stripe payment links + PDF", "Full CRM with communications log", "AI Website Builder (3-step wizard)", "Kanban project board", "Album designer (7 layouts)", "Lightroom API integration", "Analytics + revenue reports", "Custom fonts upload", "Password protection + download limits", "50GB storage", "Priority email support", "Store with 5% margin commission"],
    cta: "Start with Pro", ctaStyle: "solid",
  },
  {
    name: "Studio", badge: "For teams", monthly: 30, annual: 24, desc: "Advanced features for professionals", highlighted: false,
    features: ["Everything in Pro, plus:", "AI Command Center (daily briefing + marketing)", "White-label (your brand only)", "Up to 5 team members", "Advanced analytics + competitor analysis", "Real-time live streaming", "500GB storage", "Phone + chat support", "Store with 0% commission"],
    cta: "Start with Studio", ctaStyle: "outline",
  },
];

const COMPARISON = [
  { f: "Monthly price", s: "\u20ac0", p: "\u20ac15", st: "\u20ac24", px: "$28\u201355", zn: "$12\u201330" },
  { f: "Galleries", s: "3", p: "Unlimited", st: "Unlimited", px: "Storage-based", zn: "Storage-based" },
  { f: "Gallery themes", s: "6", p: "6", st: "6", px: "Limited", zn: false },
  { f: "Custom domain", s: false, p: true, st: true, px: "Paid plans", zn: "Paid plans" },
  { f: "AI Website Builder", s: false, p: true, st: true, px: false, zn: false },
  { f: "Photo book designer", s: true, p: true, st: true, px: false, zn: false },
  { f: "Per-photo purchasing", s: true, p: true, st: true, px: false, zn: false },
  { f: "Contracts + e-sign", s: false, p: true, st: true, px: "$12+ extra", zn: false },
  { f: "Kanban project board", s: false, p: true, st: true, px: false, zn: false },
  { f: "Lightroom integration", s: false, p: true, st: true, px: false, zn: true },
  { f: "AI Command Center", s: false, p: false, st: true, px: false, zn: false },
  { f: "Auto language detect", s: true, p: true, st: true, px: false, zn: false },
  { f: "Marketplace", s: true, p: true, st: true, px: false, zn: false },
  { f: "Store commission", s: "10% margin", p: "5% margin", st: "0%", px: "0\u201315% of sale", zn: "0%" },
  { f: "Annual cost", s: "\u20ac0", p: "\u20ac180", st: "\u20ac288", px: "$336\u2013660", zn: "$144\u2013360" },
];

const FAQS = [
  { q: "Is there really no monthly fee on the Starter plan?", a: "Yes. The Starter plan is free forever. You only pay a small commission when you sell products through the store. Gallery delivery, per-photo purchasing, photo book designer, and 6 gallery themes are all included free." },
  { q: "What happens when I upgrade?", a: "You keep all your galleries, clients, and data. The upgrade is instant \u2014 new features like AI Website Builder, Lightroom integration, project board, and contracts unlock immediately." },
  { q: "Can I switch plans anytime?", a: "Yes. Upgrade, downgrade, or cancel anytime from your dashboard. No contracts, no lock-in." },
  { q: "How does the store commission work?", a: "We charge a percentage of your margin (profit), not the full sale price. On the Studio plan, the commission is 0% \u2014 you keep everything." },
  { q: "What AI features are included in each plan?", a: "Starter gets auto language detection. Pro adds AI Website Builder. Studio includes the AI Command Center with daily briefings, marketing assistant, and competitor analysis." },
  { q: "How does Fotiqo compare to Pixieset?", a: "Fotiqo Pro at \u20ac15/month (annual) includes everything Pixieset charges $28\u201355/month for, plus AI website builder, photo book designer, per-photo purchasing, Lightroom integration, marketplace exposure, and 10-language support with auto-detection." },
  { q: "Can clients buy individual photos?", a: "Yes. Every plan includes per-photo purchasing (web-size \u20ac3, full-res \u20ac5, prints from \u20ac8), multi-select with bulk discounts (10%+ off for 5+ photos), and digital pass tiers that unlock the entire gallery." },
  { q: "Does Fotiqo support multiple languages?", a: "Yes. Galleries auto-detect your client\u2019s language from their phone number, email domain, or browser settings. 10 languages supported including Arabic with RTL layout." },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Fotiqo",
            applicationCategory: "PhotographyApplication",
            operatingSystem: "Web",
            offers: [
              { "@type": "Offer", name: "Starter", price: "0", priceCurrency: "EUR" },
              { "@type": "Offer", name: "Pro", price: "19", priceCurrency: "EUR" },
              { "@type": "Offer", name: "Studio", price: "30", priceCurrency: "EUR" },
            ],
          }),
        }}
      />
      {/* HERO */}
      <section className="text-center px-6 pb-12">
        <h1 className="font-display text-4xl sm:text-5xl text-navy-900 mb-3">Simple pricing. Incredible value.</h1>
        <p className="text-navy-500 text-lg mb-8">Start free. Upgrade when you&apos;re ready. Save 60% compared to Pixieset.</p>
        <div className="inline-flex items-center gap-2 bg-cream-200 rounded-full p-1">
          <button onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-full text-sm font-semibold transition ${!annual ? "bg-white shadow-sm text-navy-900" : "text-navy-500"}`}>Monthly</button>
          <button onClick={() => setAnnual(true)} className={`px-5 py-2 rounded-full text-sm font-semibold transition ${annual ? "bg-white shadow-sm text-navy-900" : "text-navy-500"}`}>Annual <span className="text-brand-500 text-xs ml-1">save 20%</span></button>
        </div>
      </section>

      {/* PLAN CARDS */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-6 flex flex-col ${plan.highlighted ? "bg-white border-2 border-brand-400 shadow-lift relative" : "bg-white border border-cream-300 shadow-card"}`}>
              {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</div>}
              {!plan.highlighted && <div className="text-xs font-semibold text-navy-400 mb-1">{plan.badge}</div>}
              <h3 className="font-display text-2xl text-navy-900 mt-1">{plan.name}</h3>
              <div className="mt-2 mb-1">
                <span className="font-display text-4xl text-navy-900">&euro;{annual ? plan.annual : plan.monthly}</span>
                <span className="text-navy-400 text-sm">/month</span>
              </div>
              <p className="text-sm text-navy-500 mb-5">{plan.desc}</p>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-700">
                    {f.startsWith("Everything") ? <span className="text-xs text-brand-500 font-semibold">{f}</span> : <><Check className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" /> {f}</>}
                  </li>
                ))}
              </ul>
              <Link href="/signup/photographer" className={`text-center rounded-xl py-3 font-semibold text-sm transition ${plan.ctaStyle === "solid" ? "bg-[#F97316] hover:bg-orange-600 text-white" : "border-2 border-navy-900 text-navy-900 hover:bg-navy-50"}`}>
                {plan.cta}
              </Link>
              {plan.monthly === 0 ? <p className="text-xs text-navy-400 text-center mt-2">No credit card required</p> : <p className="text-xs text-navy-400 text-center mt-2">14-day free trial</p>}
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl text-navy-900 text-center mb-8">How Fotiqo compares</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b-2 border-brand-200"><th className="text-left py-3 pr-4 text-navy-500 font-medium">Feature</th><th className="py-3 px-3 text-center text-navy-400">Starter</th><th className="py-3 px-3 text-center"><span className="font-semibold text-brand-500">Pro</span></th><th className="py-3 px-3 text-center text-navy-400">Studio</th><th className="py-3 px-3 text-center text-navy-300">Pixieset</th><th className="py-3 px-3 text-center text-navy-300">Zno</th></tr></thead>
              <tbody>
                {COMPARISON.map((r) => (
                  <tr key={r.f} className="border-b border-cream-200">
                    <td className="py-3 pr-4 text-navy-700">{r.f}</td>
                    {[r.s, r.p, r.st, r.px, r.zn].map((v, i) => (
                      <td key={i} className="py-3 px-3 text-center">
                        {typeof v === "boolean" ? (v ? <Check className={`h-4 w-4 mx-auto ${i < 3 ? "text-brand-500" : "text-navy-400"}`} /> : <Minus className="h-4 w-4 mx-auto text-navy-300" />) : <span className={`text-xs ${i < 3 ? "text-navy-700 font-medium" : "text-navy-400"}`}>{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* STORE COMMISSION EXAMPLE */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-2xl text-navy-900 text-center mb-3">How store commission works</h2>
          <p className="text-navy-500 text-center mb-8">Unlike Pixieset which charges 15% of the full sale price, Fotiqo only charges a percentage of YOUR MARGIN.</p>
          <div className="bg-cream-50 rounded-2xl p-6 space-y-4">
            <p className="text-sm text-navy-700">Your client orders a canvas print for <strong>&euro;39</strong></p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-navy-500">Lab cost</span><span className="text-navy-700">&euro;12</span></div>
              <div className="flex justify-between border-b border-cream-300 pb-2"><span className="text-navy-500">Your margin</span><span className="font-semibold text-navy-900">&euro;27</span></div>
              <div className="flex justify-between text-navy-400"><span>Pixieset Free (15% of &euro;39)</span><span>-&euro;5.85 &rarr; you keep &euro;21.15</span></div>
              <div className="flex justify-between text-brand-600"><span>Fotiqo Pro (5% of &euro;27 margin)</span><span>-&euro;1.35 &rarr; you keep <strong>&euro;25.65</strong></span></div>
              <div className="flex justify-between text-green-600 font-semibold"><span>Fotiqo Studio (0%)</span><span>-&euro;0 &rarr; you keep <strong>&euro;27.00</strong></span></div>
            </div>
          </div>
        </div>
      </section>

      {/* VISUAL DIVIDER */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-4 py-4">
          <div className="flex-1 h-px bg-cream-300" />
          <span className="text-sm font-semibold text-navy-400 uppercase tracking-wider whitespace-nowrap">A different model for venues</span>
          <div className="flex-1 h-px bg-cream-300" />
        </div>
      </div>

      {/* VENUES & RESORTS SECTION */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-brand-300 text-xs uppercase tracking-widest font-semibold mb-3">For Attractions &amp; Resorts</p>
            <h2 className="font-display text-3xl sm:text-4xl mb-4">Commission-based pricing for venue photography</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">Commission-based pricing for photography companies at hotels, water parks, and attractions. No monthly fees &mdash; you only pay when you earn.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: "2-5% commission", desc: "Pay only a small percentage of each photo sale. No upfront costs, no monthly subscriptions." },
              { title: "No monthly fee", desc: "Zero fixed costs. Your pricing scales with your revenue, making it risk-free to get started." },
              { title: "Staff management", desc: "Shifts, commissions, performance tracking, and payroll for your entire photography team." },
              { title: "Kiosk POS included", desc: "iPad and touchscreen kiosk app with Stripe Terminal, cash tracking, and offline mode built in." },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <Check className="h-5 w-5 text-brand-400 mb-3" />
                <h3 className="font-semibold text-white text-base mb-2">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/for/attractions-and-resorts" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-4 text-base shadow-lift transition hover:scale-[1.02]">
              Learn more &amp; apply <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-white/40 text-sm mt-3">Custom onboarding for every venue. Talk to our team.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-3xl text-navy-900 text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-cream-300 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="font-semibold text-navy-900 text-sm">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 text-navy-400" /> : <ChevronDown className="h-4 w-4 text-navy-400" />}
                </button>
                {openFaq === i && <div className="px-5 pb-4 text-sm text-navy-600 leading-relaxed">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 bg-gradient-to-br from-brand-600 to-brand-400 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl mb-4">Start building your photography business today</h2>
          <p className="text-white/80 mb-8">Free to start. No credit card needed. Upgrade anytime.</p>
          <Link href="/signup/photographer" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-4 text-base shadow-lift transition hover:scale-[1.02]">Get started free <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
