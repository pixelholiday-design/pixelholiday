"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Minus, ChevronDown, ChevronUp, Sparkles, Wand2, Image, Film, BookOpen, Layers, SlidersHorizontal, Eraser, Palette, Coins, Zap, Crown, Gem } from "lucide-react";

const PLANS = [
  {
    name: "Starter", badge: "Free forever", monthly: 0, annual: 0, desc: "Perfect for getting started", highlighted: false,
    features: ["3 active galleries (unlimited photos each)", "Portfolio website (fotiqo.com/p/you)", "3 booking packages", "Marketplace listing", "Basic client CRM", "6 gallery themes", "Auto language detection (10 languages)", "Per-photo purchasing + digital pass", "Photo book designer for clients", "Help center (100+ articles)", "1GB storage", "Fotiqo branding on galleries", "Store with 10% margin commission"],
    cta: "Get started free", ctaStyle: "outline",
  },
  {
    name: "Pro", badge: "Best value", monthly: 19, annual: 15, desc: "Everything you need to grow", highlighted: true,
    features: ["Everything in Starter, plus:", "Unlimited galleries", "Custom domain (yourname.com)", "Remove Fotiqo branding", "Unlimited booking packages", "Contracts + e-signatures (5 templates)", "Invoices with Stripe payment links + PDF", "Full CRM with communications log", "AI Website Builder (3-step wizard)", "Kanban project board", "Album designer (7 layouts)", "Lightroom API integration", "Analytics + revenue reports", "Custom fonts upload", "Password protection + download limits", "AI token packages available (from \u20ac5)", "50GB storage", "Priority email support", "Store with 5% margin commission"],
    cta: "Start with Pro", ctaStyle: "solid",
  },
  {
    name: "Studio", badge: "For teams", monthly: 30, annual: 24, desc: "Advanced features for professionals", highlighted: false,
    features: ["Everything in Pro, plus:", "AI Command Center (daily briefing + marketing)", "500 AI tokens/month included (worth \u20ac65+)", "White-label (your brand only)", "Up to 5 team members", "Advanced analytics + competitor analysis", "PDF sales presentations (7 audiences)", "Real-time live streaming", "500GB storage", "Phone + chat support", "Store with 0% commission"],
    cta: "Start with Studio", ctaStyle: "outline",
  },
];

const TOKEN_PACKAGES = [
  { name: "Try It", tokens: 20, price: 5, perToken: "0.25", icon: "try", badge: null, savings: null },
  { name: "Popular", tokens: 100, price: 19, perToken: "0.19", icon: "popular", badge: "Most popular", savings: "24%" },
  { name: "Best Value", tokens: 300, price: 49, perToken: "0.16", icon: "best", badge: "Best value", savings: "36%" },
];

const AI_SERVICES = [
  { name: "Photo Enhancement", desc: "Auto color, lighting & sharpness", tokens: 1, icon: "enhance" },
  { name: "Object Removal", desc: "Remove unwanted objects or people", tokens: 1, icon: "remove" },
  { name: "Background Change", desc: "Replace or blur backgrounds", tokens: 2, icon: "background" },
  { name: "Photo Restoration", desc: "Fix old or damaged photos", tokens: 2, icon: "restore" },
  { name: "Collage Creator", desc: "Multi-photo collages in seconds", tokens: 2, icon: "collage" },
  { name: "Artistic Filters", desc: "Professional styles per gallery", tokens: 3, icon: "filters" },
  { name: "Photo Book Design", desc: "AI layouts + print-ready", tokens: 4, icon: "book" },
  { name: "Video Reel + Music", desc: "Auto-generated from your best shots", tokens: 5, icon: "reel" },
  { name: "Slideshow + Music", desc: "Cinematic with licensed tracks", tokens: 8, icon: "slideshow" },
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
  { f: "AI services", s: false, p: "Token packs", st: "500/mo incl.", px: false, zn: false },
  { f: "Face recognition", s: false, p: "Token packs", st: "500/mo incl.", px: false, zn: "Selfie only" },
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
  { q: "How do AI token packages work?", a: "Buy tokens in bulk at a discount (20 for \u20ac5, 100 for \u20ac19, or 300 for \u20ac49). Each AI service costs 1\u20138 tokens. For example, photo enhancement is just 1 token (\u20ac0.16\u20130.25), a video reel is 5 tokens (\u20ac0.80\u20131.25). That\u2019s 5\u201310x cheaper than competitors like Remove.bg (\u20ac1.99/image). Tokens never expire. Studio plan includes 500 tokens/month." },
  { q: "What AI features are included in each plan?", a: "Starter gets auto language detection. Pro adds AI Website Builder and access to AI token packages for services like enhancement, background removal, reels, and more. Studio includes 500 AI tokens/month (worth \u20ac65+) plus the AI Command Center with daily briefings, marketing assistant, and competitor analysis. Need more? Buy additional token packs anytime." },
  { q: "How does Fotiqo compare to Pixieset?", a: "Fotiqo Pro at \u20ac15/month (annual) includes everything Pixieset charges $28\u201355/month for, plus AI website builder, photo book designer, per-photo purchasing, Lightroom integration, marketplace exposure, and 10-language support with auto-detection." },
  { q: "Can clients buy individual photos?", a: "Yes. Every plan includes per-photo purchasing (web-size \u20ac3, full-res \u20ac5, prints from \u20ac8), multi-select with bulk discounts (10%+ off for 5+ photos), and digital pass tiers that unlock the entire gallery." },
  { q: "Does Fotiqo support multiple languages?", a: "Yes. Galleries auto-detect your client\u2019s language from their phone number, email domain, or browser settings. 10 languages supported including Arabic with RTL layout." },
];

const iconMap: Record<string, React.ReactNode> = {
  enhance: <SlidersHorizontal className="h-5 w-5" />,
  background: <Image className="h-5 w-5" />,
  restore: <Wand2 className="h-5 w-5" />,
  remove: <Eraser className="h-5 w-5" />,
  filters: <Palette className="h-5 w-5" />,
  reel: <Film className="h-5 w-5" />,
  book: <BookOpen className="h-5 w-5" />,
  collage: <Layers className="h-5 w-5" />,
  slideshow: <Film className="h-5 w-5" />,
};

const pkgIcons: Record<string, React.ReactNode> = {
  try: <Coins className="h-6 w-6" />,
  popular: <Zap className="h-6 w-6" />,
  best: <Gem className="h-6 w-6" />,
};

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

      {/* AI TOKEN PACKAGES */}
      <section className="py-16 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Powered by Cloudinary AI
            </div>
            <h2 className="font-display text-3xl mb-3">AI Token Packages</h2>
            <p className="text-white/60 max-w-xl mx-auto">Buy tokens in bulk. Use them for any AI service. 5&ndash;10x cheaper than competitors. Tokens never expire.</p>
          </div>

          {/* Token package cards */}
          <div className="grid md:grid-cols-3 gap-5 mb-12">
            {TOKEN_PACKAGES.map((pkg) => (
              <div key={pkg.name} className={`rounded-2xl p-6 text-center relative ${pkg.badge ? "bg-brand-500/10 border-2 border-brand-400/50" : "bg-white/5 border border-white/10"}`}>
                {pkg.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">{pkg.badge}</div>}
                <div className={`mx-auto mb-3 ${pkg.badge ? "text-brand-300" : "text-white/60"}`}>{pkgIcons[pkg.icon]}</div>
                <h3 className="font-display text-xl text-white mb-1">{pkg.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="font-display text-3xl text-white">&euro;{pkg.price}</span>
                </div>
                <p className="text-brand-300 text-sm font-semibold mb-1">{pkg.tokens} tokens</p>
                <p className="text-white/40 text-xs">&euro;{pkg.perToken} per token</p>
                {pkg.savings && <p className="text-green-400 text-xs font-semibold mt-2">Save {pkg.savings}</p>}
              </div>
            ))}
          </div>

          {/* Studio unlimited callout */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-6 py-4">
              <Crown className="h-5 w-5 text-brand-300" />
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Studio plan = <span className="text-brand-300">500 tokens/month included</span></p>
                <p className="text-xs text-white/40">Worth &euro;65+. Covers ~100 enhancements + 10 reels. Buy more anytime.</p>
              </div>
            </div>
          </div>

          {/* Token costs per service */}
          <div>
            <h3 className="font-display text-xl text-white text-center mb-6">What can you do with tokens?</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AI_SERVICES.map((svc) => (
                <div key={svc.name} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition">
                  <div className="text-brand-400 flex-shrink-0">{iconMap[svc.icon]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{svc.name}</p>
                    <p className="text-xs text-white/40 truncate">{svc.desc}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="font-display text-lg text-brand-300">{svc.tokens}</span>
                    <span className="text-xs text-white/40 ml-1">{svc.tokens === 1 ? "token" : "tokens"}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-white/30 text-xs mt-4">Example: With the Popular pack (100 tokens for &euro;19), a photo enhancement costs just &euro;0.19. Studio users get 500 tokens/month included.</p>
          </div>
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

      {/* VENUES SECTION */}
      <section className="py-12 bg-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-brand-300 text-xs uppercase tracking-widest font-semibold mb-3">For venues</p>
          <h2 className="font-display text-3xl mb-3">Running photography at an attraction?</h2>
          <p className="text-white/70 mb-6">Hotels, water parks, zoos, theme parks, and more. Zero monthly fees &mdash; just 2-5% commission on photo sales.</p>
          <Link href="/for/attractions-and-resorts" className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white font-medium rounded-xl px-6 py-3 text-sm transition">Learn more &amp; apply <ArrowRight className="h-4 w-4" /></Link>
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
