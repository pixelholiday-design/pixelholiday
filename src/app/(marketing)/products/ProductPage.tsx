import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { ProductMockup } from "@/components/marketing/ProductMockup";

type ProductPageProps = {
  icon: React.ReactNode;
  badge: string;
  headline: string;
  subheadline: string;
  color: string;
  productId?: string;
  features: { title: string; description: string }[];
  highlights: string[];
  ctaText?: string;
};

export default function ProductPage({ icon, badge, headline, subheadline, color, productId, features, highlights, ctaText = "Get started free" }: ProductPageProps) {
  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-cream-100 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-500 uppercase tracking-wider mb-4">
            {icon} {badge}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-navy-900 leading-[1.1] mb-4 text-balance">{headline}</h1>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto mb-8">{subheadline}</p>
          <Link href="/signup/photographer" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-4 text-base shadow-lift transition hover:scale-[1.02]">
            {ctaText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Mockup */}
      <section className="pb-16">
        <div className="max-w-2xl mx-auto px-6">
          {productId ? (
            <ProductMockup productId={productId} />
          ) : (
            <div className={`aspect-[16/9] rounded-2xl bg-gradient-to-br ${color} shadow-lift flex items-center justify-center`}>
              <div className="bg-white/10 backdrop-blur rounded-xl w-3/4 h-3/4" />
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="space-y-2">
                <h3 className="font-display text-lg text-navy-900">{f.title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-2xl text-navy-900 text-center mb-8">What&apos;s included</h2>
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

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-brand-600 to-brand-400 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl mb-4">Ready to get started?</h2>
          <p className="text-white/80 mb-8">Free to start. No credit card. No monthly fees.</p>
          <Link href="/signup/photographer" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-4 text-base shadow-lift transition hover:scale-[1.02]">
            {ctaText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
