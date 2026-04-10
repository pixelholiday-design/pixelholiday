import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Users, Camera, DollarSign, Building, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompanyDashboard({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/v/${params.slug}`);
  const orgId = (session.user as any).orgId;

  const org = await prisma.organization.findFirst({
    where: { id: orgId, slug: params.slug },
    select: { id: true, name: true, slug: true, brandName: true, brandPrimaryColor: true },
  });
  if (!org) redirect(`/v/${params.slug}`);

  const destinations = await prisma.destination.findMany({
    where: { organizationId: org.id, isActive: true },
    orderBy: { name: "asc" },
  });

  const staffCount = await prisma.destinationStaff.count({
    where: { destination: { organizationId: org.id } },
  });

  const companyName = org.brandName || org.name;
  const primaryColor = org.brandPrimaryColor || "#0EA5A5";

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-navy-900">{companyName}</h1>
            <p className="text-sm text-navy-400">Company dashboard</p>
          </div>
          <Link href={`/v/${params.slug}`} className="text-sm text-navy-400 hover:text-brand-500">Sign out</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: MapPin, label: "Destinations", value: destinations.length },
            { icon: Users, label: "Staff", value: staffCount },
            { icon: Camera, label: "Galleries", value: 0 },
            { icon: DollarSign, label: "Revenue", value: "EUR 0" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card p-5">
                <Icon className="h-5 w-5 mb-2" style={{ color: primaryColor }} />
                <div className="font-display text-2xl text-navy-900">{s.value}</div>
                <div className="text-xs text-navy-400">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Destinations */}
        <h2 className="font-display text-xl text-navy-900 mb-4">Your Destinations</h2>
        {destinations.length === 0 ? (
          <div className="card p-8 text-center">
            <Building className="h-10 w-10 text-navy-300 mx-auto mb-3" />
            <p className="text-navy-500">No destinations yet.</p>
            <p className="text-sm text-navy-400 mt-1">Contact Fotiqo to add your venues.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((d) => (
              <Link key={d.id} href={`/v/${params.slug}/d/${d.slug}`} className="card p-5 hover:shadow-lift transition group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: primaryColor + "20", color: primaryColor }}>{d.venueType}</span>
                  <ArrowRight className="h-4 w-4 text-navy-300 group-hover:text-navy-600 transition" />
                </div>
                <h3 className="font-display text-lg text-navy-900">{d.name}</h3>
                <p className="text-xs text-navy-400 mt-1">{d.city}{d.country ? `, ${d.country}` : ""}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
