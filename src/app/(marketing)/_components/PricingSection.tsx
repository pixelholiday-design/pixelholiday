import { Check, Zap, ShoppingBag, MapPin, Building2 } from "lucide-react";
import SectionFadeIn from "./SectionFadeIn";
import { CTAPrimary } from "./CTAButton";

const CARDS = [
  {
    icon: Zap,
    title: "Digital sales",
    subtitle: "Gallery downloads, digital passes",
    highlight: "2% platform fee",
    example: "You sell a \u20AC100 gallery \u2192 you keep \u20AC98, we get \u20AC2",
    color: "border-brand-200 bg-brand-50/50",
  },
  {
    icon: ShoppingBag,
    title: "Print & product sales",
    subtitle: "Prints, canvas, albums, gifts",
    highlight: "Small commission on markup",
    example: "Lab cost: \u20AC15 | You set retail: \u20AC65 | You keep the majority of the \u20AC50 profit",
    color: "border-coral-200 bg-coral-50/50",
  },
  {
    icon: MapPin,
    title: "Marketplace bookings",
    subtitle: "Photographer-to-Go sessions",
    highlight: "10% booking fee",
    example: "Client pays \u20AC200 \u2192 you receive \u20AC180. Bookings from YOUR website \u2192 0% fee",
    color: "border-gold-500/30 bg-amber-50/50",
  },
  {
    icon: Building2,
    title: "Resort & hotel operations",
    subtitle: "Multi-location on-site photography",
    highlight: "Custom revenue share",
    example: "Tailored to your operation. Contact us to discuss your setup.",
    color: "border-navy-200 bg-navy-50/50",
    cta: true,
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-6xl px-6">
        <SectionFadeIn className="text-center mb-6">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Free to start. You only pay when you earn.
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            No monthly fees. No subscriptions. No credit card required. We succeed when you succeed.
          </p>
        </SectionFadeIn>

        {/* 3-step visual */}
        <SectionFadeIn className="mb-16" delay={100}>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { step: "1", title: "Sign up for free", desc: "Full access to galleries, website, store, and marketplace. No limits. No trial period." },
              { step: "2", title: "Grow your business", desc: "Deliver galleries, sell prints, book clients, build your brand." },
              { step: "3", title: "Share the success", desc: "We take a small commission only when you make a sale. That\u2019s it." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-brand-400 text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                  {s.step}
                </div>
                <h4 className="font-semibold text-navy-900 mb-1">{s.title}</h4>
                <p className="text-sm text-navy-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </SectionFadeIn>

        {/* Commission cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {CARDS.map((c, i) => (
            <SectionFadeIn key={c.title} delay={i * 80}>
              <div className={`rounded-2xl border-2 ${c.color} p-7 h-full`}>
                <div className="flex items-center gap-3 mb-4">
                  <c.icon className="w-5 h-5 text-navy-600" />
                  <div>
                    <h4 className="font-semibold text-navy-900">{c.title}</h4>
                    <p className="text-xs text-navy-400">{c.subtitle}</p>
                  </div>
                </div>
                <p className="text-2xl font-display font-bold text-navy-900 mb-2">{c.highlight}</p>
                <p className="text-sm text-navy-600 leading-relaxed">{c.example}</p>
                {c.cta && (
                  <a href="/contact" className="inline-block mt-4 text-sm font-medium text-brand-500 hover:text-brand-700 transition">
                    Talk to Us &rarr;
                  </a>
                )}
              </div>
            </SectionFadeIn>
          ))}
        </div>

        {/* Key message */}
        <SectionFadeIn className="text-center mb-8">
          <div className="inline-flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-navy-600 mb-4">
            {["No hidden fees", "No monthly charges", "Cancel anytime", "Your data — always yours"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-500" /> {t}
              </span>
            ))}
          </div>
          <p className="text-sm text-navy-400 mb-8">
            Other platforms charge \u20AC30\u2013\u20AC50/month <strong>plus</strong> commission. We charge \u20AC0/month. You only share when you earn.
          </p>
          <CTAPrimary>Get Started Free &mdash; No Credit Card Required</CTAPrimary>
        </SectionFadeIn>
      </div>
    </section>
  );
}
