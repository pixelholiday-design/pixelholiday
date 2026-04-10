import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  generateAutoBook,
  selectBestPhotos,
  buildSpreads,
  getBookPrice,
  MIN_PHOTOS_FOR_BOOK,
  DEFAULT_CONFIG,
  type AutoBookConfig,
} from "@/lib/automation/auto-photobook";
import { photoRef } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

/**
 * GET /api/gallery/[token]/auto-book
 * Returns an AI-generated photobook preview for the gallery.
 * The customer sees this as a suggestion they can accept or customize.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    select: {
      id: true,
      magicLinkToken: true,
      status: true,
      totalCount: true,
      customer: { select: { name: true } },
      location: { select: { name: true } },
      photographer: { select: { name: true } },
    },
  });

  if (!gallery) {
    return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404 });
  }

  // Check photo count
  const photoCount = await prisma.photo.count({
    where: { galleryId: gallery.id, aiCulled: false },
  });

  if (photoCount < MIN_PHOTOS_FOR_BOOK) {
    return NextResponse.json({
      ok: false,
      eligible: false,
      reason: `Need at least ${MIN_PHOTOS_FOR_BOOK} photos (have ${photoCount})`,
      photoCount,
    });
  }

  // Generate the auto-book
  const book = await generateAutoBook(gallery.id);
  if (!book) {
    return NextResponse.json({ ok: false, eligible: false, reason: "Could not generate book" });
  }

  // Fetch photo details for preview URLs
  const photos = await prisma.photo.findMany({
    where: { id: { in: book.photoIds } },
    select: { id: true, s3Key_highRes: true, cloudinaryId: true, isHookImage: true },
  });
  const photoMap = new Map(photos.map((p) => [p.id, p]));

  // Build preview data with thumbnail URLs
  const spreadsWithUrls = book.spreads.map(([left, right]) => ({
    left: left ? { id: left, url: photoRef(photoMap.get(left) || { s3Key_highRes: "", cloudinaryId: null }) } : null,
    right: right ? { id: right, url: photoRef(photoMap.get(right) || { s3Key_highRes: "", cloudinaryId: null }) } : null,
  }));

  const coverPhoto = photoMap.get(book.coverPhotoId);

  return NextResponse.json({
    ok: true,
    eligible: true,
    autoBook: {
      photoCount: book.photoIds.length,
      spreadCount: book.spreads.length,
      coverPhotoUrl: coverPhoto ? photoRef(coverPhoto) : null,
      config: book.config,
      price: book.price,
      spreads: spreadsWithUrls,
      photoIds: book.photoIds,
    },
    gallery: {
      customerName: gallery.customer?.name,
      locationName: gallery.location?.name,
      photographerName: gallery.photographer?.name,
    },
    bookTypes: [
      { key: "softcover", name: "Softcover", price: getBookPrice("softcover") },
      { key: "hardcover", name: "Hardcover", price: getBookPrice("hardcover"), recommended: true },
      { key: "layflat", name: "Premium Layflat", price: getBookPrice("layflat") },
    ],
  });
}

/**
 * POST /api/gallery/[token]/auto-book
 * Accept the AI-generated book and add to cart / create order.
 * Body: { bookType?, action: "preview" | "accept" }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  const body = await req.json().catch(() => ({}));
  const { bookType, action } = body as { bookType?: string; action?: string };

  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    select: { id: true, customerId: true },
  });

  if (!gallery) {
    return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404 });
  }

  const config: Partial<AutoBookConfig> = {};
  if (bookType === "softcover" || bookType === "hardcover" || bookType === "layflat") {
    config.bookType = bookType;
  }

  const book = await generateAutoBook(gallery.id, config);
  if (!book) {
    return NextResponse.json({ ok: false, error: "Not enough photos for a book" }, { status: 400 });
  }

  if (action === "accept") {
    // Create a shop order for the book
    const product = await prisma.shopProduct.findFirst({
      where: { productKey: `book_${book.config.bookType}`, isActive: true },
    });

    if (!product) {
      return NextResponse.json({ ok: false, error: "Book product not found" }, { status: 404 });
    }

    const order = await prisma.shopOrder.create({
      data: {
        customerId: gallery.customerId,
        galleryId: gallery.id,
        status: "PENDING",
        subtotal: book.price,
        total: book.price,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            unitPrice: book.price,
            totalPrice: book.price,
            bookPages: book.config.pageCount,
            bookCoverType: `${book.config.bookType}_${book.config.coverFinish}`,
            bookPhotoIds: JSON.stringify(book.photoIds),
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      price: book.price,
      bookType: book.config.bookType,
      photoCount: book.photoIds.length,
    });
  }

  // Default: just return the preview
  return NextResponse.json({
    ok: true,
    preview: {
      photoCount: book.photoIds.length,
      config: book.config,
      price: book.price,
      spreadCount: book.spreads.length,
    },
  });
}
