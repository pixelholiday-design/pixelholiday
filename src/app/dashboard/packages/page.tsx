import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Package, Plus, Clock, Users, Image, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Packages — Fotiqo" };

export default async function DashboardPackagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const profile = await prisma.photographerProfile.findUnique({
    where: { userId },
  });

  const services = profile
    ? await prisma.photographerService.findMany({
        where: { profileId: profile.id },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  // Count bookings per service
  const bookingCounts = profile
    ? await prisma.marketplaceBooking.groupBy({
        by: ["serviceId"],
        where: { photographerId: userId, serviceId: { not: null } },
        _count: { id: true },
      })
    : [];

  const countMap = new Map(bookingCounts.map((b) => [b.serviceId, b._count.id]));

  return (
    <div className="min-h-screen bg-cream-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Packages & Services</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage the photography packages and services you offer to clients.
            </p>
          </div>
          <Link
            href="/dashboard/website"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0EA5A5] text-white rounded-lg text-sm font-semibold hover:bg-[#0d9494] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </Link>
        </div>

        {!profile && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 bg-coral-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-coral-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Set up your profile first</h3>
            <p className="text-slate-500 text-sm mb-4">
              Create your photographer profile to start adding services and packages.
            </p>
            <Link
              href="/dashboard/website"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-coral-500 text-white rounded-lg text-sm font-semibold hover:bg-coral-600 transition-colors"
            >
              Create Profile
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {profile && services.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 bg-[#0EA5A5]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-[#0EA5A5]" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No packages yet</h3>
            <p className="text-slate-500 text-sm mb-4">
              Add your first photography service or package to appear in search results and accept bookings.
            </p>
            <Link
              href="/dashboard/website"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0EA5A5] text-white rounded-lg text-sm font-semibold hover:bg-[#0d9494] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Package
            </Link>
          </div>
        )}

        {profile && services.length > 0 && (
          <div className="grid gap-4">
            {services.map((svc) => {
              const bookingCount = countMap.get(svc.id) ?? 0;
              return (
                <div
                  key={svc.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-[#0EA5A5]/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-[#0EA5A5]/10 flex items-center justify-center flex-shrink-0">
                          <Image className="w-5 h-5 text-[#0EA5A5]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{svc.name}</h3>
                          {svc.duration && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {svc.duration}
                            </div>
                          )}
                        </div>
                      </div>
                      {svc.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 ml-[52px]">
                          {svc.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {svc.startingAt != null && (
                        <div className="text-xl font-bold text-slate-900">
                          {svc.currency === "EUR" ? "\u20AC" : svc.currency}
                          {svc.startingAt.toFixed(0)}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 justify-end">
                        <Users className="w-3 h-3" />
                        {bookingCount} booking{bookingCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tip section */}
        {profile && services.length > 0 && (
          <div className="bg-[#0EA5A5]/5 border border-[#0EA5A5]/20 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Tip: Optimize your packages</h3>
            <p className="text-xs text-slate-600">
              Photographers with 3 or more services listed get up to 40% more inquiries.
              Consider adding packages for different session types like portraits, events, and couples sessions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
