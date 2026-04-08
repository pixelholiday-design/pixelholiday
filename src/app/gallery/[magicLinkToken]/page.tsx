import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import GalleryView from "./GalleryView";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { magicLinkToken: string } }) {
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.magicLinkToken },
    include: { photos: { orderBy: { sortOrder: "asc" } }, customer: true, photographer: true, location: true },
  });
  if (!gallery) return notFound();
  const reel = await prisma.videoReel.findFirst({
    where: { galleryId: gallery.id, status: "READY" },
    orderBy: { createdAt: "desc" },
    select: { id: true, duration: true, thumbnailUrl: true },
  });
  return <GalleryView gallery={gallery as any} reel={reel} />;
}
