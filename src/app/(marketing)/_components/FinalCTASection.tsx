import { CTAPrimary, CTADark } from "./CTAButton";
import SectionFadeIn from "./SectionFadeIn";

export default function FinalCTASection() {
  return (
    <section className="py-24 bg-navy-900 text-center">
      <div className="mx-auto max-w-3xl px-6">
        <SectionFadeIn>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to grow your photography business?
          </h2>
          <p className="text-lg text-navy-300 mb-10">
            Join 500+ photographers who trust Fotiqo to deliver, sell, and scale.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CTAPrimary>Get Started Free</CTAPrimary>
            <CTADark href="/contact">Book a Demo</CTADark>
          </div>
        </SectionFadeIn>
      </div>
    </section>
  );
}
