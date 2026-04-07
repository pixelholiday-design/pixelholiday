import Link from "next/link";
import { ReactNode } from "react";

const NAV = [
  { href: "/admin/upload", label: "Upload" },
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/franchise", label: "Franchise" },
  { href: "/admin/ai-insights", label: "AI Insights" },
  { href: "/admin/academy", label: "Academy" },
  { href: "/admin/b2b", label: "B2B Barter" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-60 bg-slate-900 text-white p-4 space-y-2">
        <div className="text-xl font-bold mb-6">PixelHoliday</div>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="block px-3 py-2 rounded hover:bg-slate-700 text-sm">
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
