import type { Metadata } from "next";
import {
  Zap,
  ShoppingBag,
  MapPin,
  Building2,
  Check,
  ChevronDown,
  ArrowRight,
  Calculator,
  HelpCircle,
} from "lucide-react";
import SectionFadeIn from "../_components/SectionFadeIn";
import { CTAPrimary } from "../_components/CTAButton";
import PricingCalculator from "./_components/PricingCalculator";

export const metadata: Metadata = {
  title: "Pricing — Fotiqo Photography Platform",
  description:
    "Free to start. No monthly fees. You only pay a small commission when you earn. See exactly how much you keep with our interactive calculator.",
};

/* ─── Detailed commission cards ─── */
const COMMISSION_CARDS = [
  {
    icon: Zap,
    title: "Digital sales",
    subtitle: "Gallery downloads, digital passes, packages",
    highlight: "2%",
    highlightLabel: "platform fee",
    color: "border-brand-200 bg-brand-50/50",
    details: [
      "Applies to every digital sale: full galleries, single photos, digital passes",
      "No minimum. No cap. Scales with you from day one",
      "Example: You sell a gallery for \u20AC100 \u2192 you keep \u20AC98, we get \u20AC2",
      "Example: You sell 50 galleries at \u20AC80 \u2192 you earn \u20AC3,920/month, fee is only \u20AC80",
    ],
  },
  {
    icon: ShoppingBag,
    title: "Print & product sales",
    subtitle: "Prints, canvas, albums, gifts, photo books",
    highlight: "Commission",
    highlightLabel: "on your markup",
    color: "border-coral-200 bg-coral-50/50",
    details: [
      "You set the retail price. Lab cost is fixed. Your profit is the difference",
      "Small platform commission on the markup only -- not the lab cost",
      "Example: Lab cost \u20AC12 | You set retail \u20AC55 | Your markup \u20AC43 | You keep the majority",
      "The higher your markup, the more you earn. Full pricing control",
    ],
  },
  {
    icon: MapPin,
    title: "Marketplace bookings",
    subtitle: "Photographer-to-Go sessions from Fotiqo marketplace",
    highlight: "10%",
    highlightLabel: "booking fee",
    color: "border-gold-500/30 bg-amber-50/50",
    details: [
      "Only applies to bookings sourced through the Fotiqo marketplace",
      "Bookings from YOUR own website pay 0% fee",
      "Example: Client books a \u20AC200 session via marketplace \u2192 you receive \u20AC180",
      "Example: Same client books via your website \u2192 you receive \u20AC200",
    ],
  },
  {
    icon: Building2,
    title: "Resort & hotel operations",
    subtitle: "Multi-location on-site photography at scale",
    highlight: "Custom",
    highlightLabel: "revenue share",
    color: "border-navy-200 bg-navy-50/50",
    details: [
      "Tailored pricing for resort, hotel, and attraction operations",
      "Includes kiosk POS, offline mode, wristband ID, sleeping money recovery",
      "Volume discounts for multi-location deployments",
      "Contact us for a custom quote based on your operation size",
    ],
    cta: true,
  },
];

/* ─── Comparison table ─── */
const COMPETITORS = [
  {
    name: "Fotiqo",
    monthly: "\u20AC0/mo",
    galleries: "Unlimited",
    store: "150+ products",
    booking: "Built-in",
    website: "6 themes + custom domain",
    marketplace: "Included",
    highlight: true,
  },
  {
    name: "Pixieset",
    monthly: "\u20AC15\u2013\u20AC50/mo",
    galleries: "Limited by plan",
    store: "Prints only",
    booking: "No",
    website: "Basic",
    marketplace: "No",
    highlight: false,
  },
  {
    name: "ShootProof",
    monthly: "\u20AC25\u2013\u20AC100/mo",
    galleries: "Limited by plan",
    store: "Prints only",
    booking: "No",
    website: "Basic",
    marketplace: "No",
    highlight: false,
  },
  {
    name: "Zno",
    monthly: "\u20AC0\u2013\u20AC60/mo",
    galleries: "Limited by plan",
    store: "Albums + prints",
    booking: "No",
    website: "No",
    marketplace: "No",
    highlight: false,
  },
];

const COMPARISON_ROWS = [
  { label: "Monthly fee", key: "monthly" as const },
  { label: "Client galleries", key: "galleries" as const },
  { label: "Online store", key: "store" as const },
  { label: "Booking system", key: "booking" as const },
  { label: "Website builder", key: "website" as const },
  { label: "Photographer marketplace", key: "marketplace" as const },
];

/* ─── FAQ data ─── */
const FAQS = [
  {
    q: "Is Fotiqo really free to use?",
    a: "Yes. There are no monthly fees, no subscriptions, and no credit card required to sign up. You get full access to every feature from day one. We only earn when you earn -- through a small commission on your sales.",
  },
  {
    q: "How does the 2% digital sales fee work?",
    a: "When a client purchases a digital gallery, photo, or pass through your Fotiqo-powered gallery, 2% of the transaction total goes to Fotiqo. For a \u20AC100 gallery sale, that is just \u20AC2. The fee is automatically deducted before payout.",
  },
  {
    q: "What if I only use the gallery and website features but do not sell anything?",
    a: "Then you pay nothing. There is no charge for using galleries, building your website, managing your calendar, or showcasing your portfolio. Fees only apply when you make a sale.",
  },
  {
    q: "Do I pay the 10% marketplace fee on my existing clients?",
    a: "No. The 10% fee only applies to new bookings sourced through the Fotiqo marketplace. If a client books through your own website, social media, or word of mouth, the marketplace fee is 0%.",
  },
  {
    q: "How do print sale commissions work?",
    a: "When a client orders a print or product, the lab charges a fixed production cost. You set the retail price. The difference is your markup. Fotiqo takes a small commission on that markup -- not on the lab cost. You control your profit margin entirely.",
  },
  {
    q: "Can I switch to Fotiqo from another platform?",
    a: "Absolutely. We offer free migration assistance for photographers coming from Pixieset, ShootProof, Zno, and other platforms. Your galleries, client data, and settings can be imported seamlessly.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-navy-900 py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900/40" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <SectionFadeIn>
            <p className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">
              Pricing
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Free to start. You only pay when you earn.
            </h1>
            <p className="text-lg md:text-xl text-navy-300 max-w-2xl mx-auto mb-8">
              No monthly fees. No subscriptions. No credit card required.
              We take a small commission only when you make a sale. That&apos;s it.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-navy-400">
              {["No hidden fees", "No monthly charges", "Cancel anytime", "Your data -- always yours"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-400" /> {t}
                </span>
              ))}
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ─── 3-Step How It Works ─── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <SectionFadeIn className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">
              How it works
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900">
              Three steps to earning more
            </h2>
          </SectionFadeIn>

          <SectionFadeIn delay={100}>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Sign up for free",
                  desc: "Full access to galleries, website, store, booking system, and marketplace. No limits. No trial period. No credit card.",
                },
                {
                  step: "2",
                  title: "Grow your business",
                  desc: "Deliver galleries, sell prints, book clients, build your brand. Use one feature or all of them -- it is your choice.",
                },
                {
                  step: "3",
                  title: "Share the success",
                  desc: "We take a small commission only when you make a sale. You keep the vast majority. We succeed only when you succeed.",
                },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-400 text-white font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-navy-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ─── Detailed Commission Cards ─── */}
      <section className="py-20 bg-cream-100">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">
              Commission breakdown
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Transparent pricing. No surprises.
            </h2>
            <p className="text-lg text-navy-500 max-w-2xl mx-auto">
              Here is exactly what you pay for each type of sale. No hidden fees, no tiers, no lock-in.
            </p>
          </SectionFadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {COMMISSION_CARDS.map((c, i) => (
              <SectionFadeIn key={c.title} delay={i * 80}>
                <div className={`rounded-2xl border-2 ${c.color} p-7 h-full`}>
                  <div className="flex items-center gap-3 mb-4">
                    <c.icon className="w-5 h-5 text-navy-600" />
                    <div>
                      <h3 className="font-semibold text-navy-900">{c.title}</h3>
                      <p className="text-xs text-navy-400">{c.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-display font-bold text-navy-900">{c.highlight}</span>
                    <span className="text-sm text-navy-500">{c.highlightLabel}</span>
                  </div>

                  <ul className="space-y-2.5">
                    {c.details.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-navy-600 leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>

                  {c.cta && (
                    <a
                      href="/contact"
                      className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-brand-500 hover:text-brand-700 transition"
                    >
                      Talk to us <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Interactive Calculator ─── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <SectionFadeIn className="text-center mb-14">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-6 h-6 text-brand-500" />
            </div>
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">
              Earnings calculator
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              See what you keep
            </h2>
            <p className="text-lg text-navy-500 max-w-2xl mx-auto">
              Drag the sliders to match your expected monthly sales and see exactly how much you earn -- and how little we charge.
            </p>
          </SectionFadeIn>

          <SectionFadeIn delay={100}>
            <PricingCalculator />
          </SectionFadeIn>
        </div>
      </section>

      {/* ─── Comparison Table ─── */}
      <section className="py-20 bg-cream-100">
        <div className="mx-auto max-w-5xl px-6">
          <SectionFadeIn className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">
              Compare
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              How we stack up
            </h2>
            <p className="text-lg text-navy-500 max-w-2xl mx-auto">
              Other platforms charge monthly fees <strong>plus</strong> commission.
              We charge nothing upfront. You only share when you earn.
            </p>
          </SectionFadeIn>

          <SectionFadeIn delay={100}>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-navy-400 pb-4 pr-4 whitespace-nowrap">
                      Feature
                    </th>
                    {COMPETITORS.map((c) => (
                      <th
                        key={c.name}
                        className={`text-center text-sm font-semibold pb-4 px-4 whitespace-nowrap ${
                          c.highlight ? "text-brand-500" : "text-navy-600"
                        }`}
                      >
                        {c.name}
                        {c.highlight && (
                          <span className="block text-[10px] font-medium text-brand-400 mt-0.5">
                            Recommended
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, ri) => (
                    <tr
                      key={row.key}
                      className={ri % 2 === 0 ? "bg-white" : "bg-cream-50"}
                    >
                      <td className="py-3.5 pr-4 text-sm font-medium text-navy-700 whitespace-nowrap">
                        {row.label}
                      </td>
                      {COMPETITORS.map((c) => (
                        <td
                          key={c.name}
                          className={`py-3.5 px-4 text-sm text-center whitespace-nowrap ${
                            c.highlight
                              ? "font-semibold text-navy-900"
                              : "text-navy-500"
                          }`}
                        >
                          {c[row.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-6">
          <SectionFadeIn className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">
              FAQ
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900">
              Common questions
            </h2>
          </SectionFadeIn>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <SectionFadeIn key={i} delay={i * 60}>
                <details className="group rounded-2xl border border-navy-100 bg-white overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left">
                    <span className="font-semibold text-navy-900 pr-4">{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-navy-400 shrink-0 transition group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-5 text-sm text-navy-600 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-24 bg-navy-900">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <SectionFadeIn>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Start earning today
            </h2>
            <p className="text-lg text-navy-300 mb-4">
              Join thousands of photographers who switched to commission-based pricing
              and never looked back.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-navy-400 mb-10">
              {["Free forever plan", "No credit card", "Full feature access"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-400" /> {t}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAPrimary>Get Started Free</CTAPrimary>
              <a
                href="/features"
                className="inline-flex items-center gap-2 text-white/80 font-medium hover:text-white transition"
              >
                Explore all features <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </SectionFadeIn>
        </div>
      </section>
    </>
  );
}
