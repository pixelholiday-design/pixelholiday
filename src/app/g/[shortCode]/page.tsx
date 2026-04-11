import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ShortLinkPage({
  params,
}: {
  params: { shortCode: string };
}) {
  const gallery = await prisma.gallery.findUnique({
    where: { shortCode: params.shortCode },
    select: { magicLinkToken: true },
  });

  if (!gallery) return notFound();

  redirect(`/gallery/${gallery.magicLinkToken}`);
}
