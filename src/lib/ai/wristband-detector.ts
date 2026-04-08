import { prisma } from "@/lib/db";

/**
 * Detects whether a photo is a wristband-scan shot (photographer deliberately
 * captured a guest's wristband so subsequent burst photos can auto-link to
 * their customer record).
 *
 * In production this would call a vision model (Cloudinary QR detection or
 * jsQR against raw bytes). For the offline demo we use two heuristics:
 *   1. A filename pattern like "WB-XXXXX" / "WRIST-XXXXX"
 *   2. A deterministic 1-in-20 hash fallback so the detector always
 *      exercises the auto-link path in test data.
 */
export async function analyzePhotoForWristband(photoId: string): Promise<{
  isWristband: boolean;
  code?: string;
  confidence?: "HIGH" | "LOW";
}> {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return { isWristband: false };

  const key = photo.s3Key_highRes || "";
  const match =
    key.match(/WB[-_]?([A-Z0-9]{4,})/i) || key.match(/WRIST[-_]?([A-Z0-9]{4,})/i);
  if (match) {
    const code = (match[0] || "").toUpperCase().replace(/_/g, "-");
    await prisma.photo.update({
      where: { id: photoId },
      data: { isWristbandPhoto: true, extractedWristbandCode: code },
    });
    return { isWristband: true, code, confidence: "HIGH" };
  }

  // Deterministic low-probability fallback (≈1 in 20 photos)
  let h = 0;
  for (let i = 0; i < photoId.length; i++) {
    h = ((h << 5) - h + photoId.charCodeAt(i)) | 0;
  }
  if (Math.abs(h) % 20 === 0) {
    const code = `WB-${Math.abs(h).toString(36).toUpperCase().slice(0, 5)}`;
    await prisma.photo.update({
      where: { id: photoId },
      data: { isWristbandPhoto: true, extractedWristbandCode: code },
    });
    return { isWristband: true, code, confidence: "LOW" };
  }

  return { isWristband: false };
}

/**
 * Given a burst of recently-uploaded photo IDs, look for a wristband photo
 * inside the batch, match it to a Customer by `wristbandCode`, and move all
 * non-wristband photos from the batch into that customer's active gallery
 * for today. The wristband photo itself is marked `aiCulled = true` so it
 * never appears in the customer-facing gallery.
 */
export async function autoLinkBurstToWristband(
  photoIds: string[],
  photographerId: string
): Promise<{
  linked: number;
  galleryId?: string;
  customerId?: string;
  reason?: string;
}> {
  if (!photoIds?.length) return { linked: 0, reason: "empty batch" };

  const photos = await prisma.photo.findMany({ where: { id: { in: photoIds } } });
  const wristbandPhoto = photos.find(
    (p) => p.isWristbandPhoto && p.extractedWristbandCode
  );
  if (!wristbandPhoto) return { linked: 0, reason: "no wristband photo in batch" };

  const customer = await prisma.customer.findFirst({
    where: { wristbandCode: wristbandPhoto.extractedWristbandCode! },
  });
  if (!customer) return { linked: 0, reason: "no customer match" };

  // Find or create today's gallery for this customer
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  let gallery = await prisma.gallery.findFirst({
    where: { customerId: customer.id, createdAt: { gte: dayStart } },
  });

  if (!gallery) {
    // Best-effort location resolution: use the customer's location if set,
    // otherwise inherit it from the source gallery of the first batch photo.
    let locationId = customer.locationId || null;
    if (!locationId) {
      const source = await prisma.gallery.findUnique({
        where: { id: photos[0].galleryId },
        select: { locationId: true },
      });
      locationId = source?.locationId || null;
    }
    if (!locationId) {
      return { linked: 0, reason: "no location for customer/gallery" };
    }

    gallery = await prisma.gallery.create({
      data: {
        status: "PREVIEW_ECOM",
        customerId: customer.id,
        photographerId,
        locationId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const toLink = photos.filter((p) => p.id !== wristbandPhoto.id);
  for (const p of toLink) {
    await prisma.photo.update({
      where: { id: p.id },
      data: { galleryId: gallery.id },
    });
  }
  await prisma.photo.update({
    where: { id: wristbandPhoto.id },
    data: { aiCulled: true, aiCullReason: "wristband_scan" },
  });

  return { linked: toLink.length, galleryId: gallery.id, customerId: customer.id };
}
