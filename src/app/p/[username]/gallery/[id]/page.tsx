import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PhotographerGalleryClient from "./PhotographerGalleryClient";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ username: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await prisma.photographerProfile.findUnique({ where: { username } });
  return { title: profile ? `Gallery — ${profile.businessName || username}` : "Gallery" };
}

export default async function PhotographerGalleryPage({ params }: Props) {
  const { username, id } = await params;

  const profile = await prisma.photographerProfile.findUnique({
    where: { username },
    select: { userId: true, businessName: true, primaryColor: true, websiteTheme: true, username: true, logoUrl: true },
  });
  if (!profile) notFound();

  // id can be a gallery ID or magicLinkToken
  const gallery = await prisma.gallery.findFirst({
    where: {
      OR: [{ id }, { magicLinkToken: id }],
      photographerId: profile.userId,
    },
    include: {
      photos: { where: { aiCulled: false }, orderBy: { sortOrder: "asc" } },
      videos: true,
    },
  });
  if (!gallery) notFound();

  return (
    <PhotographerGalleryClient
      profile={profile as any}
      gallery={gallery as any}
    />
  );
}
