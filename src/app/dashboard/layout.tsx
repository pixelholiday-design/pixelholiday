import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Home, Image, Globe, Package, Calendar, ShoppingBag,
  MessageSquare, Star, Wallet, Settings, Camera, LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/galleries", label: "Galleries", icon: Image },
  { href: "/dashboard/website", label: "Website", icon: Globe },
  { href: "/dashboard/packages", label: "Packages", icon: Package },
  { href: "/dashboard/availability", label: "Availability", icon: Calendar },
  { href: "/dashboard/store", label: "Store", icon: ShoppingBag },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/payouts", label: "Payouts", icon: Wallet },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login/photographer");

  const userName = session.user.name || "Photographer";

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Sidebar — desktop */}
      <nav className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-cream-300 z-30 hidden lg:flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-cream-200">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-8 w-8" />
            <div>
              <span className="font-display text-lg text-navy-900 block leading-tight">Fotiqo</span>
              <span className="text-[10px] uppercase tracking-widest text-brand-500 font-semibold">Studio</span>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-navy-600 hover:bg-brand-50 hover:text-brand-600 transition"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User + profile link */}
        <div className="px-3 py-4 border-t border-cream-200">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-cream-100 transition"
          >
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-navy-900 truncate">{userName}</div>
              <div className="text-[10px] text-navy-400">Studio</div>
            </div>
          </Link>
          <Link
            href="/find-photographer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-navy-400 hover:text-brand-500 transition mt-1"
          >
            <Camera className="h-3.5 w-3.5" />
            View marketplace profile
          </Link>
        </div>
      </nav>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-cream-300 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-7 w-7" />
          <span className="font-display text-lg text-navy-900">Studio</span>
        </Link>
        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-cream-300 flex items-center justify-around h-14">
        {[NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2], NAV_ITEMS[6], NAV_ITEMS[9]].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-navy-500"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="lg:ml-60 pt-14 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
