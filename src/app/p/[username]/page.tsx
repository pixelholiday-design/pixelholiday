import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PhotographerWebsite from "./PhotographerWebsite";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await prisma.photographerProfile.findUnique({ where: { username } });
  if (!profile) return { title: "Not Found" };
  return {
    title: profile.seoTitle || `${profile.businessName || username} — Photography`,
    description: profile.seoDescription || profile.tagline || `Professional photography by ${profile.businessName || username}`,
    openGraph: {
      title: profile.seoTitle || `${profile.businessName || username} — Photography`,
      description: profile.seoDescription || profile.tagline || "",
      images: profile.seoImage ? [{ url: profile.seoImage }] : profile.coverPhotoUrl ? [{ url: profile.coverPhotoUrl }] : [],
    },
  };
}

export default async function PhotographerPage({ params }: Props) {
  const { username } = await params;
  const profile = await prisma.photographerProfile.findUnique({
    where: { username },
    include: {
      services: { orderBy: { sortOrder: "asc" } },
      testimonials: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } },
      user: { select: { name: true, email: true } },
    },
  });
  if (!profile) notFound();

  // Fetch featured galleries with photos
  let featuredGalleries: any[] = [];
  if (profile.featuredGalleryIds.length > 0) {
    featuredGalleries = await prisma.gallery.findMany({
      where: { id: { in: profile.featuredGalleryIds } },
      include: { photos: { where: { aiCulled: false }, take: 8, orderBy: { sortOrder: "asc" } } },
    });
  }

  return <PhotographerWebsite profile={profile as any} galleries={featuredGalleries} />;
}
