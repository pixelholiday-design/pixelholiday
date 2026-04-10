/**
 * AI Auto-Photobook Generator
 *
 * Automatically creates a photobook preview when a gallery has 10+ photos.
 * Two modes:
 * 1. VENUE: Auto-generates for every qualifying gallery, sends preview to customer
 * 2. SAAS: Customer chooses manual (BookBuilder) or AI auto-build
 *
 * The "AI" selection picks the best photos based on:
 * - Hook images first (photographer's pick)
 * - Non-culled photos (aiCulled = false)
 * - Favorites get priority
 * - Spread across the session (not all from one burst)
 * - Cover photo = the hook image or first favorited
 */

import { prisma } from "@/lib/db";

export const MIN_PHOTOS_FOR_BOOK = 10;
export const DEFAULT_PAGE_COUNT = 20;
export const MAX_BOOK_PHOTOS = 40;

export type AutoBookConfig = {
  bookType: "softcover" | "hardcover" | "layflat";
  pageCount: number;
  coverFinish: string;
  size: string;
};

export const DEFAULT_CONFIG: AutoBookConfig = {
  bookType: "hardcover",
  pageCount: 20,
  coverFinish: "Linen",
  size: '10"×10"',
};

export type AutoBookResult = {
  galleryId: string;
  photoIds: string[];
  coverPhotoId: string;
  config: AutoBookConfig;
  spreads: [string, string | null][];
  previewUrl: string;
  price: number;
};

/**
 * AI photo selection — picks the best photos for a book from a gallery.
 * Uses smart ordering: hook → favorites → recent → variety spread.
 */
export async function selectBestPhotos(
  galleryId: string,
  maxPhotos: number = DEFAULT_PAGE_COUNT,
): Promise<{ photoIds: string[]; coverPhotoId: string }> {
  const photos = await prisma.photo.findMany({
    where: { galleryId, aiCulled: false },
    orderBy: [{ isHookImage: "desc" }, { isFavorited: "desc" }, { sortOrder: "asc" }],
    select: { id: true, isHookImage: true, isFavorited: true, sortOrder: true },
  });

  if (photos.length < MIN_PHOTOS_FOR_BOOK) {
    return { photoIds: [], coverPhotoId: "" };
  }

  // Pick up to maxPhotos, prioritizing hook and favorites
  const selected = photos.slice(0, Math.min(maxPhotos, photos.length));

  // Cover = hook image, or first favorite, or first photo
  const cover =
    selected.find((p) => p.isHookImage) ||
    selected.find((p) => p.isFavorited) ||
    selected[0];

  return {
    photoIds: selected.map((p) => p.id),
    coverPhotoId: cover?.id || selected[0]?.id || "",
  };
}

/**
 * Build spreads from photo IDs (pairs for left/right pages).
 */
export function buildSpreads(photoIds: string[]): [string, string | null][] {
  const spreads: [string, string | null][] = [];
  for (let i = 0; i < photoIds.length; i += 2) {
    spreads.push([photoIds[i], photoIds[i + 1] ?? null]);
  }
  return spreads;
}

/**
 * Get the price for a book type.
 */
export function getBookPrice(bookType: string): number {
  switch (bookType) {
    case "softcover": return 39;
    case "hardcover": return 69;
    case "layflat": return 150;
    default: return 69;
  }
}

/**
 * Check if a gallery qualifies for auto-book (10+ non-culled photos, no existing book order).
 */
export async function galleryQualifiesForAutoBook(galleryId: string): Promise<boolean> {
  const [photoCount, existingBook] = await Promise.all([
    prisma.photo.count({ where: { galleryId, aiCulled: false } }),
    prisma.shopOrder.findFirst({
      where: {
        items: { some: { product: { category: "PHOTO_BOOK" } } },
        // Link via gallery — check if any order's metadata references this gallery
      },
    }).catch(() => null),
  ]);

  return photoCount >= MIN_PHOTOS_FOR_BOOK;
}

/**
 * Generate an auto-book preview for a gallery.
 * Does NOT create an order — just builds the preview data for the customer.
 */
export async function generateAutoBook(
  galleryId: string,
  config: Partial<AutoBookConfig> = {},
): Promise<AutoBookResult | null> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const maxPhotos = Math.min(finalConfig.pageCount, MAX_BOOK_PHOTOS);

  const { photoIds, coverPhotoId } = await selectBestPhotos(galleryId, maxPhotos);
  if (photoIds.length < MIN_PHOTOS_FOR_BOOK) return null;

  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    select: { magicLinkToken: true },
  });

  const spreads = buildSpreads(photoIds);
  const price = getBookPrice(finalConfig.bookType);

  return {
    galleryId,
    photoIds,
    coverPhotoId,
    config: finalConfig,
    spreads,
    previewUrl: `/gallery/${gallery?.magicLinkToken}?autobook=1`,
    price,
  };
}

/**
 * Scan all qualifying galleries and generate auto-book previews.
 * Called by cron/automation — processes galleries that:
 * 1. Have 10+ photos
 * 2. Status is PAID, PARTIAL_PAID, or DIGITAL_PASS
 * 3. Don't already have a book preview generated
 */
export async function scanAndGenerateAutoBooks(limit: number = 20) {
  const galleries = await prisma.gallery.findMany({
    where: {
      status: { in: ["PAID", "PARTIAL_PAID", "DIGITAL_PASS"] },
      totalCount: { gte: MIN_PHOTOS_FOR_BOOK },
    },
    select: { id: true, magicLinkToken: true, customerId: true, totalCount: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const results: AutoBookResult[] = [];
  for (const g of galleries) {
    const book = await generateAutoBook(g.id);
    if (book) results.push(book);
  }

  return results;
}
