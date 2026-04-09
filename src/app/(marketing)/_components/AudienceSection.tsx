import { Palmtree, Heart, User, Building2 } from "lucide-react";
import SectionFadeIn from "./SectionFadeIn";

const AUDIENCES = [
  {
    icon: Palmtree,
    title: "Resort & Hotel Photography",
    desc: "Manage on-site photographers at hotels, water parks, and attractions. Kiosk POS, wristband identification, multi-destination support.",
    color: "text-brand-400",
    bg: "bg-brand-50",
  },
  {
    icon: Heart,
    title: "Wedding & Event Photographers",
    desc: "Deliver beautiful galleries to couples. Sell albums and prints. Book sessions. Build your portfolio website.",
    color: "text-coral-500",
    bg: "bg-coral-50",
  },
  {
    icon: User,
    title: "Freelance & Portrait Photographers",
    desc: "List on our marketplace. Get bookings from new clients. Build your personal brand with a professional website.",
    color: "text-gold-500",
    bg: "bg-amber-50",
  },
  {
    icon: Building2,
    title: "Photography Businesses & Studios",
    desc: "Manage teams, payroll, equipment, and training. Multi-location support. Franchise your photography brand.",
    color: "text-navy-600",
    bg: "bg-navy-50",
  },
];

export default function AudienceSection() {
  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Who is Fotiqo for?
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            From solo freelancers to multi-location resort operations &mdash; one platform for every kind of photography business.
          </p>
        </SectionFadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {AUDIENCES.map((a, i) => (
            <SectionFadeIn key={a.title} delay={i * 100}>
              <div className="card p-8 h-full hover:shadow-lift transition-all duration-300 hover:-translate-y-1 group">
                <div className={`w-14 h-14 rounded-2xl ${a.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                  <a.icon className={`w-7 h-7 ${a.color}`} />
                </div>
                <h3 className="font-display text-lg font-bold text-navy-900 mb-3">{a.title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{a.desc}</p>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
