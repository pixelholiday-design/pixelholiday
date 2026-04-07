import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import KioskView from "./KioskView";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { galleryId: string } }) {
  const gallery = await prisma.gallery.findUnique({
    where: { id: params.galleryId },
    include: { photos: { orderBy: { sortOrder: "asc" } }, customer: true },
  });
  if (!gallery) return notFound();
  return <KioskView gallery={gallery as any} />;
}
