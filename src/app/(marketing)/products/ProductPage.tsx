import Link from "next/link";
import Image from "next/image";
import { Check, ArrowRight, Star, Zap } from "lucide-react";
import { ProductMockup } from "@/components/marketing/ProductMockup";

type Feature = { title: string; description: string };
type UseCase = { title: string; description: string };

type ProductPageProps = {
  icon: React.ReactNode;
  badge: string;
  headline: string;
  subheadline: string;
  color: string;
  productId?: string;
  features: Feature[];
  highlights: string[];
  ctaText?: string;
  /** Detailed feature sections with alternating layout */
  detailedFeatures?: { title: string; description: string; bullets: string[] }[];
  /** Use cases / who it's for */
  useCases?: UseCase[];
  /** Stats to show social proof */
  stats?: { value: string; label: string }[];
  /** Competitor comparison callout */
  comparisonNote?: string;
};

export default function ProductPage({
  icon, badge, headline, subheadline, color, productId, features, highlights,
  ctaText = "Get started free", detailedFeatures, useCases, stats, comparisonNote,
}: ProductPageProps) {
  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-cream-100 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-500 uppercase tracking-wider mb-4">
            {icon} {badge}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-navy-900 leading-[1.1] mb-4 text-balance">{headline}</h1>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto mb-8">{subheadline}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/signup/photographer" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-4 text-base shadow-lift transition hover:scale-[1.02]">
              {ctaText} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="text-navy-500 hover:text-brand-500 text-sm font-medium transition">
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Mockup */}
      <section className="pb-16">
        <div className="max-w-2xl mx-auto px-6">
          {productId ? (
            <ProductMockup productId={productId} />
          ) : (
            <div className={`aspect-[16/9] rounded-2xl bg-gradient-to-br ${color} shadow-lift`} />
          )}
        </div>
      </section>

      {/* Stats bar */}
      {stats && stats.length > 0 && (
        <section className="py-10 bg-navy-900">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl sm:text-4xl text-white">{s.value}</div>
                <div className="text-xs text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Detailed feature sections (alternating layout) */}
      {detailedFeatures && detailedFeatures.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6 space-y-24">
            {detailedFeatures.map((df, i) => (
              <div key={df.title} className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-10 lg:gap-16 items-center`}>
                <div className="flex-1">
                  <h3 className="font-display text-2xl sm:text-3xl text-navy-900 mb-3">{df.title}</h3>
                  <p className="text-navy-500 mb-6 leading-relaxed">{df.description}</p>
                  <ul className="space-y-2.5">
                    {df.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-navy-700">
                        <Check className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lift relative">
                    <Image
                      src={`https://picsum.photos/seed/fqdf${i * 7 + 60}/800/600`}
                      alt={`${df.title} feature illustration`}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Feature grid */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl text-navy-900 text-center mb-4">Everything included</h2>
          <p className="text-navy-500 text-center mb-10 max-w-xl mx-auto">No feature gates. No hidden upgrades. Get the full experience from day one.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-card transition">
                <h3 className="font-display text-base text-navy-900 mb-2">{f.title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      {useCases && useCases.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="font-display text-3xl text-navy-900 text-center mb-10">Who it's for</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {useCases.map((uc) => (
                <div key={uc.title} className="border border-cream-300 rounded-xl p-6 hover:border-brand-300 transition">
                  <h3 className="font-display text-lg text-navy-900 mb-2">{uc.title}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{uc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Highlights checklist */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-2xl text-navy-900 text-center mb-8">Full feature list</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {highlights.map((h) => (
              <div key={h} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                <Check className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-navy-700">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison callout */}
      {comparisonNote && (
        <section className="py-12 bg-brand-50 border-y border-brand-100">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Zap className="h-6 w-6 text-brand-500 mx-auto mb-3" />
            <p className="text-navy-700 font-medium leading-relaxed">{comparisonNote}</p>
            <Link href="/pricing" className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-700 text-sm font-semibold mt-3 transition">
              Compare plans <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* Testimonial */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-0.5 mb-4">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-gold-400 text-gold-400" />)}
          </div>
          <p className="text-navy-700 text-lg leading-relaxed italic mb-4">
            &ldquo;Fotiqo has everything I need in one place. I stopped paying for four separate tools and my workflow is so much simpler now.&rdquo;
          </p>
          <div className="text-sm text-navy-500">Sarah Chen, Wedding Photographer</div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-brand-600 to-brand-400 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl mb-4">Ready to get started?</h2>
          <p className="text-white/80 mb-8">Free to start. No credit card. No monthly fees on the Starter plan.</p>
          <Link href="/signup/photographer" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-4 text-base shadow-lift transition hover:scale-[1.02]">
            {ctaText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
