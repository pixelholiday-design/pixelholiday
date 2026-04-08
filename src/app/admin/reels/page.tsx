import { prisma } from "@/lib/db";
import Link from "next/link";
import { Film, Sparkles, Clock } from "lucide-react";
import ReelsClient from "./ReelsClient";

export const dynamic = "force-dynamic";

export default async function AdminReelsPage() {
  const [reels, eligibleGalleries] = await Promise.all([
    prisma.videoReel.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        gallery: {
          select: {
            id: true,
            magicLinkToken: true,
            location: { select: { name: true } },
            customer: { select: { name: true } },
            photographer: { select: { name: true } },
            status: true,
          },
        },
      },
    }),
    prisma.gallery.findMany({
      where: {
        videoReels: { none: {} },
        photos: { some: {} },
      },
      include: {
        _count: { select: { photos: true } },
        location: { select: { name: true } },
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const eligible = eligibleGalleries
    .filter((g) => g._count.photos >= 5)
    .slice(0, 25)
    .map((g) => ({
      id: g.id,
      label: `${g.location?.name || "—"} · ${g.customer?.name || "Guest"} (${g._count.photos} photos)`,
    }));

  const ready = reels.filter((r) => r.status === "READY").length;
  const totalDuration = reels.reduce((s, r) => s + r.duration, 0);

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">AI</div>
        <h1 className="heading text-4xl mt-1">Auto-Reels</h1>
        <p className="text-navy-400 mt-1">
          AI-generated highlight clips, stitched from photographer bursts.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-brand-500/10 text-brand-700 flex items-center justify-center">
            <Film className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">All-time reels</div>
          <div className="font-display text-3xl text-navy-900">{reels.length}</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Ready to view</div>
          <div className="font-display text-3xl text-navy-900">{ready}</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-coral-500/10 text-coral-600 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Total runtime</div>
          <div className="font-display text-3xl text-navy-900">{totalDuration}s</div>
        </div>
      </div>

      <ReelsClient
        reels={reels.map((r) => {
          let photoCount = 0;
          try {
            photoCount = JSON.parse(r.photoIds).length;
          } catch {}
          return {
            id: r.id,
            galleryId: r.galleryId,
            galleryName: r.gallery?.location?.name || "—",
            customerName: r.gallery?.customer?.name || "Guest",
            photographerName: r.gallery?.photographer?.name || "—",
            magicLinkToken: r.gallery?.magicLinkToken || "",
            photoCount,
            duration: r.duration,
            musicTrack: r.musicTrack || "—",
            status: r.status,
            thumbnailUrl: r.thumbnailUrl,
            createdAt: r.createdAt.toISOString(),
          };
        })}
        eligibleGalleries={eligible}
      />

      {reels.length === 0 && (
        <div className="bg-white rounded-2xl ring-1 ring-cream-300 p-8 text-center text-navy-500">
          No reels yet. Upload a gallery with 5+ photos and a reel will be generated automatically,
          {eligible.length > 0 ? " or pick a gallery above to generate one now." : "."}
          {" "}
          <Link href="/admin/upload" className="text-brand-700 font-semibold hover:underline">
            Upload a gallery →
          </Link>
        </div>
      )}
    </div>
  );
}
