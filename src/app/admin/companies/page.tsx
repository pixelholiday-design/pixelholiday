import { prisma } from "@/lib/db";
import Link from "next/link";
import { Building, Users, MapPin, DollarSign, Plus, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await prisma.organization.findMany({
    where: { type: { in: ["VENUE_COMPANY", "HEADQUARTERS", "FRANCHISE"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, slug: true, type: true, brandName: true,
      country: true, city: true, commissionRate: true, createdAt: true,
      _count: { select: { staff: true, locations: true } },
    },
  });

  const destinations = await prisma.destination.groupBy({
    by: ["organizationId"],
    _count: true,
  });
  const destMap = new Map(destinations.map((d) => [d.organizationId, d._count]));

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy-900">Companies</h1>
          <p className="text-navy-500 text-sm mt-1">Venue partner photography companies</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5"><Building className="h-5 w-5 text-brand-500 mb-1" /><div className="font-display text-2xl text-navy-900">{companies.length}</div><div className="text-xs text-navy-400">Companies</div></div>
        <div className="card p-5"><MapPin className="h-5 w-5 text-coral-500 mb-1" /><div className="font-display text-2xl text-navy-900">{destinations.reduce((s, d) => s + d._count, 0)}</div><div className="text-xs text-navy-400">Destinations</div></div>
        <div className="card p-5"><Users className="h-5 w-5 text-green-500 mb-1" /><div className="font-display text-2xl text-navy-900">{companies.reduce((s, c) => s + c._count.staff, 0)}</div><div className="text-xs text-navy-400">Total staff</div></div>
      </div>

      {companies.length === 0 ? (
        <div className="card p-12 text-center">
          <Building className="h-12 w-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-500">No companies yet.</p>
          <p className="text-sm text-navy-400 mt-1">Approve a venue application to create the first company.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-5 py-3 bg-cream-50 border-b border-cream-200 text-xs font-semibold text-navy-500 uppercase tracking-wide">
            <div>Company</div><div>Destinations</div><div>Staff</div><div>Commission</div><div>Portal</div>
          </div>
          {companies.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-5 py-4 border-b border-cream-100 items-center hover:bg-cream-50 transition">
              <div>
                <div className="font-semibold text-navy-900 text-sm">{c.brandName || c.name}</div>
                <div className="text-xs text-navy-400">{c.country}{c.city ? `, ${c.city}` : ""} &middot; {c.type}</div>
              </div>
              <div className="text-sm text-navy-700 text-center">{destMap.get(c.id) || 0}</div>
              <div className="text-sm text-navy-700 text-center">{c._count.staff}</div>
              <div className="text-sm text-navy-700 text-center">{c.commissionRate ? `${(c.commissionRate * 100).toFixed(0)}%` : "Tiered"}</div>
              <div>
                {c.slug && (
                  <Link href={`/v/${c.slug}`} className="text-xs text-brand-500 hover:text-brand-700 flex items-center gap-1">
                    /v/{c.slug} <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
