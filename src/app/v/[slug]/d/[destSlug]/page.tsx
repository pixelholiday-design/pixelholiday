import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Camera, Upload, ShoppingBag, Users, Calendar, DollarSign, BarChart3, Settings, ArrowLeft, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DestinationPage({ params }: { params: { slug: string; destSlug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/v/${params.slug}`);
  const orgId = (session.user as any).orgId;

  const org = await prisma.organization.findFirst({ where: { id: orgId, slug: params.slug } });
  if (!org) redirect(`/v/${params.slug}`);

  const dest = await prisma.destination.findFirst({
    where: { organizationId: org.id, slug: params.destSlug },
  });
  if (!dest) redirect(`/v/${params.slug}/dashboard`);

  const staffCount = await prisma.destinationStaff.count({ where: { destinationId: dest.id } });
  const primaryColor = org.brandPrimaryColor || "#0EA5A5";

  const navItems = [
    { href: ``, label: "Dashboard", icon: BarChart3 },
    { href: `/upload`, label: "Upload", icon: Upload },
    { href: `/galleries`, label: "Galleries", icon: Camera },
    { href: `/kiosk`, label: "Kiosk POS", icon: ShoppingBag },
    { href: `/staff`, label: "Staff", icon: Users },
    { href: `/shifts`, label: "Shifts", icon: Calendar },
    { href: `/commissions`, label: "Commissions", icon: DollarSign },
    { href: `/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link href={`/v/${params.slug}/dashboard`} className="text-xs text-navy-400 hover:text-brand-500 flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3 w-3" /> Back to {org.brandName || org.name}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl text-navy-900">{dest.name}</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: primaryColor + "20", color: primaryColor }}>{dest.venueType}</span>
          </div>
          <p className="text-sm text-navy-400">{dest.city}{dest.country ? `, ${dest.country}` : ""}</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Quick nav */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={`/v/${params.slug}/d/${params.destSlug}${item.href}`} className="flex-shrink-0 bg-white rounded-xl border border-cream-200 px-4 py-3 flex items-center gap-2 text-sm text-navy-700 hover:border-brand-300 transition cursor-pointer">
                <Icon className="h-4 w-4" style={{ color: primaryColor }} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="card p-5"><div className="font-display text-2xl text-navy-900">0</div><div className="text-xs text-navy-400">Galleries today</div></div>
          <div className="card p-5"><div className="font-display text-2xl text-navy-900">0</div><div className="text-xs text-navy-400">Photos today</div></div>
          <div className="card p-5"><div className="font-display text-2xl text-navy-900">{staffCount}</div><div className="text-xs text-navy-400">Staff assigned</div></div>
          <div className="card p-5"><div className="font-display text-2xl text-navy-900">EUR 0</div><div className="text-xs text-navy-400">Revenue today</div></div>
        </div>

        <div className="card p-8 text-center">
          <Camera className="h-10 w-10 mx-auto mb-3" style={{ color: primaryColor }} />
          <h2 className="font-display text-xl text-navy-900 mb-2">Destination ready</h2>
          <p className="text-navy-500 text-sm">This destination is configured. Staff can now log in with their PIN to start uploading photos and processing sales.</p>
        </div>
      </div>
    </div>
  );
}
