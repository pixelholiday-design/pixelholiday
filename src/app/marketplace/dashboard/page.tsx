import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Camera, User, Image, Package, Calendar, Star, Wallet, Settings, Search, TrendingUp, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/marketplace/dashboard", label: "Dashboard", icon: TrendingUp },
  { href: "/marketplace/profile", label: "My Profile", icon: User },
  { href: "/marketplace/portfolio", label: "Portfolio", icon: Image },
  { href: "/marketplace/packages", label: "Packages", icon: Package },
  { href: "/marketplace/availability", label: "Availability", icon: Calendar },
  { href: "/marketplace/bookings", label: "Bookings", icon: Camera },
  { href: "/marketplace/reviews", label: "Reviews", icon: Star },
  { href: "/marketplace/payouts", label: "Payouts", icon: Wallet },
  { href: "/marketplace/settings", label: "Settings", icon: Settings },
];

export default async function MarketplaceDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const profile = await prisma.marketplaceProfile.findUnique({ where: { userId } });
  const photographerProfile = await prisma.photographerProfile.findFirst({ where: { userId } });
  const bookingCount = photographerProfile ? await prisma.marketplaceBooking.count({ where: { profileId: photographerProfile.id } }) : 0;

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Sidebar */}
      <nav className="hidden lg:flex w-56 bg-white border-r border-cream-300 flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-cream-200">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-7 w-7" />
            <div>
              <span className="font-display text-base text-navy-900">Fotiqo</span>
              <span className="text-[9px] text-green-500 font-semibold block -mt-0.5">Marketplace</span>
            </div>
          </Link>
        </div>
        <div className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-navy-600 hover:bg-brand-50 hover:text-brand-600 transition">
                <Icon className="h-4 w-4" />{item.label}
              </Link>
            );
          })}
        </div>
        <div className="px-3 py-3 border-t border-cream-200">
          <Link href="/signup/photographer" className="block bg-brand-50 border border-brand-200 rounded-lg p-3 text-center hover:bg-brand-100 transition">
            <div className="text-xs font-semibold text-brand-600">Want more tools?</div>
            <div className="text-[10px] text-brand-500 mt-0.5">Upgrade to Fotiqo Studio</div>
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 px-6 py-8 max-w-4xl">
        <h1 className="font-display text-3xl text-navy-900 mb-2">Welcome{profile?.displayName ? `, ${profile.displayName}` : ""}!</h1>
        <p className="text-navy-500 text-sm mb-8">Your marketplace dashboard</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-5"><div className="font-display text-2xl text-navy-900">{bookingCount}</div><div className="text-xs text-navy-400">Bookings</div></div>
          <div className="card p-5"><div className="font-display text-2xl text-navy-900">{profile?.averageRating?.toFixed(1) || "N/A"}</div><div className="text-xs text-navy-400">Rating</div></div>
          <div className="card p-5"><div className="font-display text-2xl text-navy-900">{profile?.hourlyRate ? `EUR ${profile.hourlyRate}` : "Set rate"}</div><div className="text-xs text-navy-400">Hourly rate</div></div>
        </div>

        {/* Profile completeness */}
        <div className="card p-5 mb-8">
          <h2 className="font-display text-lg text-navy-900 mb-3">Complete your profile</h2>
          <div className="space-y-2">
            {[
              { label: "Display name", done: !!profile?.displayName },
              { label: "Specialty", done: !!profile?.specialty },
              { label: "Bio", done: !!profile?.bio },
              { label: "Hourly rate", done: !!profile?.hourlyRate },
              { label: "Portfolio link", done: !!profile?.portfolioUrl },
              { label: "City & country", done: !!profile?.city && !!profile?.country },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] ${item.done ? "bg-green-500" : "bg-cream-300"}`}>{item.done ? "✓" : ""}</span>
                <span className={item.done ? "text-navy-500" : "text-navy-900 font-medium"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Public profile link */}
        {photographerProfile && (
          <div className="card p-5">
            <h2 className="font-display text-lg text-navy-900 mb-2">Your public profile</h2>
            <Link href={`/find-photographer/${photographerProfile.username}`} className="text-brand-500 hover:text-brand-700 text-sm flex items-center gap-1">
              fotiqo.com/find-photographer/{photographerProfile.username} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
