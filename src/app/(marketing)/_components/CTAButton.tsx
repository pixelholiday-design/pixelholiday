import Link from "next/link";

export function CTAPrimary({ href = "/signup", children = "Get Started Free" }: { href?: string; children?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-coral-500 px-7 py-3.5 text-base font-semibold text-white shadow-lift transition hover:bg-coral-600 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
    >
      {children}
    </Link>
  );
}

export function CTAGhost({ href = "#how-it-works", children = "See How It Works" }: { href?: string; children?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 hover:border-white/60"
    >
      {children}
    </Link>
  );
}

export function CTADark({ href = "/contact", children = "Book a Demo" }: { href?: string; children?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-navy-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-navy-700"
    >
      {children}
    </Link>
  );
}
