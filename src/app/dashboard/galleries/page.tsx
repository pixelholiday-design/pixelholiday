import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import GalleryDeliveryClient from "./GalleryDeliveryClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gallery Delivery — Fotiqo" };

export default async function GalleryDeliveryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const galleries = await prisma.gallery.findMany({
    where: { photographerId: userId },
    include: {
      photos: { select: { id: true, s3Key_highRes: true, cloudinaryId: true, isPurchased: true, isFavorited: true }, orderBy: { sortOrder: "asc" } },
      customer: { select: { id: true, name: true, email: true, whatsapp: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const profile = await prisma.photographerProfile.findUnique({
    where: { userId },
    select: { username: true },
  });

  return <GalleryDeliveryClient galleries={galleries as any} username={profile?.username || null} />;
}
