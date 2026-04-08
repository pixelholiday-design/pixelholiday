import { prisma } from "@/lib/db";

async function mockWhatsApp(to: string | null | undefined, body: string) {
  console.log("[mock-whatsapp] to=%s body=%s", to ?? "n/a", body);
  return { ok: true };
}

export async function runSneakPeek(locationId?: string) {
  const where: any = { status: "HOOK_ONLY" };
  if (locationId) where.locationId = locationId;
  const galleries = await prisma.gallery.findMany({
    where,
    include: { customer: true, photos: true },
    take: 50,
  });

  const created: string[] = [];
  for (const g of galleries) {
    const already = await prisma.sneakPeek.findFirst({
      where: { galleryId: g.id, customerId: g.customerId },
    });
    if (already) continue;

    const hero =
      g.photos.find((p) => p.isHookImage) ?? g.photos[0] ?? null;

    const peek = await prisma.sneakPeek.create({
      data: {
        customerId: g.customerId,
        galleryId: g.id,
        photoId: hero?.id ?? null,
      },
    });

    await mockWhatsApp(
      g.customer.whatsapp,
      `Sneak peek of your photos! Magic link: /gallery/${g.magicLinkToken}`,
    );
    created.push(peek.id);
  }
  return { sent: created.length, ids: created };
}
