import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Camera,
  Calendar,
  DollarSign,
  MessageSquare,
  Star,
  Image,
  Clock,
  ArrowUpRight,
  TrendingUp,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — Fotiqo" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const profile = await prisma.photographerProfile.findUnique({
    where: { userId },
    include: {
      services: true,
      portfolioPhotos: { take: 1 },
    },
  });

  if (!profile) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-coral-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-coral-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Fotiqo</h2>
          <p className="text-slate-500 mb-6">
            Set up your photographer profile to start receiving bookings, managing galleries, and growing your business.
          </p>
          <Link
            href="/dashboard/website"
            className="inline-flex items-center gap-2 px-6 py-3 bg-coral-500 text-white rounded-lg text-sm font-semibold hover:bg-coral-600 transition-colors"
          >
            Create Your Profile
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Fetch marketplace stats ────────────────────
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    upcomingBookings,
    monthlyRevenue,
    newInquiries,
    recentReviews,
    totalBookingsThisMonth,
    allReviews,
    availabilityCount,
  ] = await Promise.all([
    // Next 5 upcoming bookings
    prisma.marketplaceBooking.findMany({
      where: {
        photographerId: userId,
        sessionDate: { gte: now },
        status: { in: ["PENDING", "CONFIRMED", "DEPOSIT_PAID", "FULLY_PAID"] },
      },
      orderBy: { sessionDate: "asc" },
      take: 5,
    }),
    // Revenue this month (completed bookings)
    prisma.marketplaceBooking.aggregate({
      where: {
        photographerId: userId,
        status: "COMPLETED",
        isPaid: true,
        sessionDate: { gte: startOfMonth },
      },
      _sum: { totalPrice: true },
    }),
    // New inquiries count
    prisma.photographerInquiry.count({
      where: {
        profileId: profile.id,
        status: "NEW",
      },
    }),
    // Last 3 reviews
    prisma.photographerReview.findMany({
      where: { photographerId: userId, isPublic: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    // Total bookings this month
    prisma.marketplaceBooking.count({
      where: {
        photographerId: userId,
        sessionDate: { gte: startOfMonth },
      },
    }),
    // All reviews for average calculation
    prisma.photographerReview.aggregate({
      where: { photographerId: userId },
      _avg: { rating: true },
      _count: true,
    }),
    // Availability entries for next 7 days
    prisma.photographerAvailability.count({
      where: {
        userId,
        isAvailable: true,
        date: { gte: now, lte: new Date(Date.now() + 7 * 86400000) },
      },
    }),
  ]);

  const revenue = monthlyRevenue._sum.totalPrice ?? 0;
  const avgRating = allReviews._avg.rating ?? profile.averageRating;
  const reviewCount = allReviews._count ?? profile.totalReviews;

  // ── Profile completeness ───────────────────────
  const completenessChecks = [
    { label: "Business name", done: !!profile.businessName },
    { label: "Bio", done: !!profile.bio },
    { label: "Specialties", done: profile.specialties.length > 0 },
    { label: "Services", done: profile.services.length > 0 },
    { label: "Portfolio photos", done: profile.portfolioPhotos.length > 0 },
    { label: "City & country", done: !!profile.city && !!profile.country },
    { label: "Hourly rate", done: !!profile.hourlyRate },
    { label: "Profile photo", done: !!profile.profilePhotoUrl },
  ];
  const completedCount = completenessChecks.filter((c) => c.done).length;
  const completenessPercent = Math.round((completedCount / completenessChecks.length) * 100);

  return (
    <div className="min-h-screen bg-cream-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {profile.businessName ?? session.user?.name ?? "Photographer"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Here is an overview of your marketplace activity.
            </p>
          </div>
          <Link
            href={`/find-photographer/${profile.username}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <User className="w-4 h-4" />
            View Public Profile
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Profile Completeness */}
        {completenessPercent < 100 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Profile Completeness</h3>
              <span className="text-sm font-bold text-coral-500">{completenessPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full mb-4">
              <div
                className="h-2 bg-coral-500 rounded-full transition-all"
                style={{ width: `${completenessPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {completenessChecks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  {c.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  )}
                  <span className={c.done ? "text-slate-500" : "text-slate-700 font-medium"}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            label="Revenue This Month"
            value={`\u20AC${revenue.toLocaleString("en", { minimumFractionDigits: 0 })}`}
            sub={`${totalBookingsThisMonth} booking${totalBookingsThisMonth !== 1 ? "s" : ""}`}
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
            label="Upcoming Bookings"
            value={String(upcomingBookings.length)}
            sub={`${availabilityCount} days available this week`}
          />
          <StatCard
            icon={<MessageSquare className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
            label="New Inquiries"
            value={String(newInquiries)}
            sub="Awaiting response"
            highlight={newInquiries > 0}
          />
          <StatCard
            icon={<Star className="w-5 h-5 text-coral-500" />}
            iconBg="bg-coral-50"
            label="Average Rating"
            value={avgRating.toFixed(1)}
            sub={`${reviewCount} review${reviewCount !== 1 ? "s" : ""}`}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Bookings */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Upcoming Bookings</h3>
              <Link
                href="/dashboard/availability"
                className="text-xs text-coral-500 hover:text-coral-600 font-medium"
              >
                Manage Availability
              </Link>
            </div>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No upcoming bookings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Camera className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {b.sessionType} — {b.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {b.sessionDate.toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        at {b.sessionStartTime}
                        {b.sessionLocation ? ` \u2022 ${b.sessionLocation}` : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-900">
                        {"\u20AC"}{b.totalPrice}
                      </span>
                      <p className="text-xs text-slate-400 capitalize">
                        {b.status.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Recent Reviews</h3>
              <Link
                href="/dashboard/reviews"
                className="text-xs text-coral-500 hover:text-coral-600 font-medium"
              >
                View All
              </Link>
            </div>
            {recentReviews.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Star className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReviews.map((r) => (
                  <div key={r.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    {r.title && (
                      <p className="text-xs font-semibold text-slate-800 mb-0.5">{r.title}</p>
                    )}
                    <p className="text-xs text-slate-500 line-clamp-2">{r.comment}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {r.customerName} &mdash;{" "}
                      {r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            href="/dashboard/galleries"
            icon={<Image className="w-5 h-5" />}
            label="Create Gallery"
            description="Upload and share client photos"
          />
          <QuickAction
            href="/dashboard/website"
            icon={<Camera className="w-5 h-5" />}
            label="Add to Portfolio"
            description="Showcase your best work"
          />
          <QuickAction
            href="/dashboard/availability"
            icon={<Clock className="w-5 h-5" />}
            label="Update Availability"
            description="Set your open schedule"
          />
          <QuickAction
            href={`/find-photographer/${profile.username}`}
            icon={<TrendingUp className="w-5 h-5" />}
            label="View Marketplace Profile"
            description="See how clients find you"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-coral-500" : "text-slate-900"}`}>
        {value}
      </p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-coral-200 hover:shadow-sm transition-all group"
    >
      <div className="w-9 h-9 rounded-lg bg-coral-50 text-coral-500 flex items-center justify-center mb-3 group-hover:bg-coral-100 transition-colors">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{description}</p>
    </Link>
  );
}
