import { Mail, Phone, MapPin, Clock, ChevronDown, MessageCircle, Send } from "lucide-react";
import SectionFadeIn from "../_components/SectionFadeIn";
import { CTAPrimary } from "../_components/CTAButton";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Fotiqo  — Let\'s Talk",
  description:
    "Get in touch with Fotiqo. Whether you\'re a freelance photographer, studio, or resort operator, we\'d love to hear from you.",
};

/* ── Hero ────────────────────────────────────── */
function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 pt-32 pb-20 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(41,171,226,0.12),transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <SectionFadeIn>
          <p className="label-xs mb-4 text-brand-300 tracking-widest uppercase">Contact</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 text-balance">
            Let&apos;s talk about your photography business
          </h1>
          <p className="text-lg text-navy-300 max-w-xl mx-auto leading-relaxed">
            Whether you&apos;re a solo freelancer or a resort with 50 photographers,
            we&apos;d love to hear from you.
          </p>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ── Info cards ───────────────────────────────── */
const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@fotiqo.com",
    href: "mailto:hello@fotiqo.com",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+216 XX XXX XXX",
    href: "https://wa.me/216XXXXXXXX",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Monastir, Tunisia",
    href: null,
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Mon–Fri, 9 am–6 pm CET",
    href: null,
  },
];

function ContactInfoCards() {
  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">
        Other ways to reach us
      </h2>
      <div className="space-y-4">
        {contactInfo.map((c) => (
          <div key={c.label} className="card flex items-start gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
              <c.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-0.5">
                {c.label}
              </p>
              {c.href ? (
                <a
                  href={c.href}
                  className="text-navy-900 font-medium hover:text-brand-500 transition"
                >
                  {c.value}
                </a>
              ) : (
                <p className="text-navy-900 font-medium">{c.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Map placeholder ─────────────────────────── */
function MapPlaceholder() {
  return (
    <SectionFadeIn className="mt-12">
      <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-cream-100 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-10 w-10 text-brand-400 mx-auto mb-3" />
          <p className="text-navy-700 font-medium mb-2">Monastir, Tunisia</p>
          <a
            href="https://maps.google.com/?q=Monastir,Tunisia"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-500 hover:text-brand-600 font-medium underline underline-offset-2 transition"
          >
            View on Google Maps
          </a>
        </div>
      </div>
    </SectionFadeIn>
  );
}

/* ── FAQ ──────────────────────────────────────── */
const faqs = [
  {
    q: "Is Fotiqo really free to start?",
    a: "Yes. There are no monthly fees and no setup costs. We charge a small commission on sales you make through the platform, so we only earn when you earn.",
  },
  {
    q: "How quickly can I get set up?",
    a: "Most photographers are up and running within 15 minutes. Create an account, upload your first gallery, and send the magic link to your client. That\'s it.",
  },
  {
    q: "Do you support resorts and multi-location teams?",
    a: "Absolutely. Fotiqo was built for resort photography from day one. We support kiosk POS, wristband scanning, multi-photographer teams, and offline-first workflows.",
  },
  {
    q: "Can I use my own branding?",
    a: "Yes. You can customise your gallery pages, client emails, and portfolio website with your own logo, colours, and domain name.",
  },
];

function FAQSection() {
  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-3xl px-6">
        <SectionFadeIn>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 text-center mb-12">
            Frequently asked questions
          </h2>
        </SectionFadeIn>
        <div className="space-y-6">
          {faqs.map((f, i) => (
            <SectionFadeIn key={f.q} delay={i * 80}>
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-navy-900 mb-2">{f.q}</h3>
                <p className="text-navy-500 leading-relaxed">{f.a}</p>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ───────────────────────────────── */
function ContactCTA() {
  return (
    <section className="py-24 bg-navy-900 text-center">
      <div className="mx-auto max-w-3xl px-6">
        <SectionFadeIn>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started? It&apos;s free.
          </h2>
          <p className="text-lg text-navy-300 mb-10">
            No credit card required. Start delivering galleries in minutes.
          </p>
          <CTAPrimary>Get Started Free</CTAPrimary>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ── Page ─────────────────────────────────────── */
export default function ContactPage() {
  return (
    <>
      <ContactHero />

      {/* Form + Info two-column section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form  — takes 3 cols */}
            <div className="lg:col-span-3">
              <SectionFadeIn>
                <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">
                  Send us a message
                </h2>
                <ContactForm />
              </SectionFadeIn>
            </div>

            {/* Info  — takes 2 cols */}
            <div className="lg:col-span-2">
              <SectionFadeIn delay={150}>
                <ContactInfoCards />
              </SectionFadeIn>
            </div>
          </div>

          <MapPlaceholder />
        </div>
      </section>

      <FAQSection />
      <ContactCTA />
    </>
  );
}
