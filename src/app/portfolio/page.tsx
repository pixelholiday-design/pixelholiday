import { prisma } from "@/lib/db";
import { cleanUrl } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

type ShowcasePhoto = { id: string; cloudinaryId: string | null; s3Key_highRes: string };

export default async function PortfolioPage() {
  // Prefer retouched showcase photos; fall back to any photo with a Cloudinary id
  let photos: ShowcasePhoto[] = await prisma.photo
    .findMany({
      where: { isRetouched: true, cloudinaryId: { not: null } },
      take: 24,
      orderBy: { createdAt: "desc" },
      select: { id: true, cloudinaryId: true, s3Key_highRes: true },
    })
    .catch(() => []);

  if (photos.length === 0) {
    photos = await prisma.photo
      .findMany({
        where: { cloudinaryId: { not: null } },
        take: 24,
        orderBy: { createdAt: "desc" },
        select: { id: true, cloudinaryId: true, s3Key_highRes: true },
      })
      .catch(() => []);
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="text-center py-12">
        <h1 className="text-5xl font-light tracking-wide">PixelHoliday</h1>
        <p className="text-gray-400 mt-2">Capturing your best moments, professionally</p>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-6xl mx-auto">
        {photos.length === 0 ? (
          <p className="col-span-4 text-gray-500 text-center py-12">
            Our portfolio is being curated — check back soon.
          </p>
        ) : (
          photos.map((p) => (
            <div
              key={p.id}
              className="aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-pink-500 to-purple-700"
            >
              {p.cloudinaryId && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cleanUrl(p.cloudinaryId, 600)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
