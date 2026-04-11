import Link from "next/link";
import Image from "next/image";

const COLUMNS = [
  {
    title: "Products",
    links: [
      { href: "/products/client-gallery", label: "Client Gallery" },
      { href: "/products/website-builder", label: "Website Builder" },
      { href: "/products/online-store", label: "Online Store" },
      { href: "/products/studio-manager", label: "Studio Manager" },
      { href: "/products/marketplace", label: "Marketplace" },
      { href: "/products/mobile-gallery", label: "Mobile Gallery" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/for/attractions-and-resorts", label: "Attractions & Resorts" },
      { href: "/for/wedding-photographers", label: "Wedding Photography" },
      { href: "/for/freelance-photographers", label: "Freelance" },
      { href: "/for/studios", label: "Studios" },
      { href: "/for/water-parks", label: "Water Parks" },
      { href: "/apply", label: "Apply for venues" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/about", label: "Blog" },
      { href: "/contact", label: "Help Center" },
      { href: "/features", label: "API Docs" },
      { href: "/pricing", label: "Pricing" },
      { href: "/contact", label: "Status" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/about", label: "Careers" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer aria-label="Footer navigation" className="bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/fotiqo-icon.svg" alt="Fotiqo" width={28} height={28} className="w-7 h-7 brightness-0 invert" />
              <span className="font-display text-lg font-bold">
                Foti<span className="text-brand-300">qo</span>
              </span>
            </Link>
            <p className="text-sm text-navy-300 leading-relaxed mb-6">
              The complete photography platform for galleries, print sales, bookings, and studio management.
            </p>
            {/* Social icons */}
            <div className="flex gap-4">
              {["Instagram", "Facebook", "Twitter", "LinkedIn", "YouTube"].map((s) => (
                <a key={s} href="#" className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-xs text-navy-300 hover:bg-brand-700 hover:text-white transition cursor-pointer" aria-label={`Follow us on ${s}`}>
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-navy-300 hover:text-white transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-navy-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-navy-400">
            &copy; {new Date().getFullYear()} Fotiqo. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-navy-400">
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
