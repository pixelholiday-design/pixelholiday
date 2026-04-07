import { prisma } from "@/lib/db";

export default async function PortfolioPage() {
  const photos = await prisma.photo.findMany({
    where: { isRetouched: true },
    take: 24,
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="text-center py-12">
        <h1 className="text-5xl font-light tracking-wide">PixelHoliday</h1>
        <p className="text-gray-400 mt-2">Capturing your best moments, professionally</p>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-6xl mx-auto">
        {photos.length === 0 && <p className="col-span-4 text-gray-500 text-center">Portfolio coming soon.</p>}
        {photos.map((p) => (
          <div key={p.id} className="aspect-square bg-gradient-to-br from-pink-500 to-purple-700" />
        ))}
      </div>
    </div>
  );
}
