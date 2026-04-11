import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { photoRef } from "@/lib/cloudinary";
import PhotoBookEditor from "@/components/photobook/PhotoBookEditor";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { magicLinkToken: string };
}): Promise<Metadata> {
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.magicLinkToken },
    select: { photographer: { select: { name: true } }, location: { select: { name: true } } },
  });
  if (!gallery) return { title: "Gallery Not Found" };

  const name = gallery.photographer?.name || "Fotiqo";
  return {
    title: `Photo Book Editor — ${name}`,
    description: `Design a custom photo book from ${name}'s gallery. Powered by Fotiqo.`,
  };
}

export default async function PhotoBookEditorPage({
  params,
}: {
  params: { magicLinkToken: string };
}) {
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.magicLinkToken },
    include: {
      photos: {
        where: { aiCulled: false },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          s3Key_highRes: true,
          cloudinaryId: true,
          isHookImage: true,
          isFavorited: true,
          isPurchased: true,
          sortOrder: true,
        },
      },
      photographer: { select: { name: true } },
      location: { select: { name: true } },
    },
  });

  if (!gallery) notFound();

  // Build thumbnail URLs for the editor
  const photos = gallery.photos.map((p) => ({
    id: p.id,
    url: photoRef(p),
    isHookImage: p.isHookImage,
    isFavorited: p.isFavorited,
  }));

  // Check for existing saved design
  const savedDesign = await prisma.photoBookDesign.findFirst({
    where: { galleryId: gallery.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <PhotoBookEditor
        galleryId={gallery.id}
        magicLinkToken={params.magicLinkToken}
        photos={photos}
        photographerName={gallery.photographer?.name || "Photographer"}
        locationName={gallery.location?.name || ""}
        savedDesign={savedDesign ? {
          id: savedDesign.id,
          title: savedDesign.title,
          bookType: savedDesign.bookType,
          bookSize: savedDesign.bookSize,
          paper: savedDesign.paper,
          pages: savedDesign.pages as unknown[],
          coverDesign: savedDesign.coverDesign as Record<string, unknown> | null,
          status: savedDesign.status,
        } : null}
      />
    </div>
  );
}
