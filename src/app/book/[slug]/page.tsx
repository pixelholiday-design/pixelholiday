import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PackageDetail from "./PackageDetail";
import BookingWidget from "./BookingWidget";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const pkg = await prisma.photoPackage.findUnique({
    where: { slug },
    select: { name: true, shortDescription: true },
  });
  if (!pkg) return { title: "Package Not Found" };
  return {
    title: `${pkg.name} \u00b7 PixelHoliday`,
    description: pkg.shortDescription || `Book your ${pkg.name} photography session`,
  };
}

export default async function PackageDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { cancelled?: string };
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const pkg = await prisma.photoPackage.findUnique({
    where: { slug, isActive: true },
    include: {
      addOns: { orderBy: { sortOrder: "asc" } },
      location: { select: { id: true, name: true, city: true } },
    },
  });

  if (!pkg) notFound();

  const locations = await prisma.location
    .findMany({
      where: { isActive: true },
      select: { id: true, name: true, city: true },
      orderBy: { name: "asc" },
    })
    .catch(() => []);

  const data = JSON.parse(JSON.stringify(pkg));

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.png" alt="PixelHoliday" className="h-8 w-8 rounded-lg" />
          <a href="/book" className="text-sm text-brand-400 hover:underline">&larr; All packages</a>
        </div>
      </div>

      {sp.cancelled === "true" && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            Payment was cancelled. You can try booking again below.
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-8 items-start">
          <PackageDetail pkg={data} />
          <BookingWidget
            pkg={data}
            locations={JSON.parse(JSON.stringify(locations))}
          />
        </div>
      </div>
    </div>
  );
}
