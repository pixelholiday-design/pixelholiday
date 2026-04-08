import { prisma } from "@/lib/db";
import BookForm from "./BookForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a session · PixelHoliday",
  description: "Reserve a professional photo session at your holiday destination.",
};

export default async function BookPage() {
  const locations = await prisma.location
    .findMany({
      where: { isActive: true },
      select: { id: true, name: true, city: true, country: true, locationType: true },
      orderBy: { name: "asc" },
    })
    .catch(() => [] as Array<{ id: string; name: string; city: string | null; country: string | null; locationType: string | null }>);

  return (
    <div className="min-h-screen bg-cream-100 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.png" alt="PixelHoliday" className="h-10 w-10" />
          <div>
            <div className="font-display text-2xl text-navy-900">PixelHoliday</div>
            <div className="text-xs text-navy-400 uppercase tracking-wider">Book a session</div>
          </div>
        </div>

        <div className="card p-8">
          <h1 className="font-display text-3xl text-navy-900 mb-1">Reserve your moment.</h1>
          <p className="text-navy-400 mb-6 text-sm">
            Pick a location, a time, and a session type. A photographer will confirm within the hour.
          </p>

          <BookForm locations={locations} />
        </div>

        <p className="text-center text-xs text-navy-400 mt-6">
          Powered by PixelHoliday · GDPR compliant
        </p>
      </div>
    </div>
  );
}
