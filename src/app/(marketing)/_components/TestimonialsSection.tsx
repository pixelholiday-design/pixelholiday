import { Star } from "lucide-react";
import SectionFadeIn from "./SectionFadeIn";

const TESTIMONIALS = [
  {
    quote: "Fotiqo transformed how we deliver photos at our resort. Revenue increased 40% in the first season.",
    name: "Ahmed B.",
    role: "Hotel General Manager",
    initials: "AB",
  },
  {
    quote: "I switched from Pixieset and never looked back. The all-in-one platform saves me hours every week.",
    name: "Elena K.",
    role: "Wedding Photographer",
    initials: "EK",
  },
  {
    quote: "The marketplace brought me 12 new clients in my first month. Best decision I ever made.",
    name: "Marcus T.",
    role: "Freelance Photographer",
    initials: "MT",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-brand-700 via-brand-600 to-navy-800">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Loved by photographers worldwide
          </h2>
        </SectionFadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <SectionFadeIn key={t.name} delay={i * 120}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 h-full flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <p className="text-white/90 leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-brand-200">{t.role}</p>
                  </div>
                </div>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
