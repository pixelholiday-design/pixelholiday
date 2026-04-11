import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateProductMockup } from "@/lib/fulfillment/printful-mockups";

export const dynamic = "force-dynamic";

const R2_PUBLIC = process.env.R2_PUBLIC_URL || "https://photos.fotiqo.com";
const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME || "dmbzcqxlr";

/**
 * Resolve a photo ID or URL to a publicly-accessible URL that
 * Printful's servers can fetch for mockup generation.
 */
async function resolvePublicPhotoUrl(photoIdOrUrl: string): Promise<string> {
  // Already a public URL
  if (photoIdOrUrl.startsWith("https://res.cloudinary.com") || photoIdOrUrl.startsWith("https://picsum.photos")) {
    return photoIdOrUrl;
  }

  // If it's a photo ID, look it up
  if (!photoIdOrUrl.startsWith("http") && !photoIdOrUrl.startsWith("/")) {
    const photo = await prisma.photo.findUnique({
      where: { id: photoIdOrUrl },
      select: { cloudinaryId: true, s3Key_highRes: true },
    });
    if (photo?.cloudinaryId) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/c_limit,w_1200,q_80/${photo.cloudinaryId}`;
    }
    if (photo?.s3Key_highRes) {
      return `${R2_PUBLIC}/${photo.s3Key_highRes}`;
    }
  }

  // It's a local API URL like /api/photo/...
  if (photoIdOrUrl.startsWith("/api/photo/")) {
    const key = decodeURIComponent(photoIdOrUrl.replace("/api/photo/", ""));
    // Try R2 public URL
    return `${R2_PUBLIC}/${key}`;
  }

  // It's a full fotiqo.com URL
  if (photoIdOrUrl.includes("fotiqo.com/api/photo/")) {
    const key = decodeURIComponent(photoIdOrUrl.split("/api/photo/")[1] || "");
    return `${R2_PUBLIC}/${key}`;
  }

  // Use a sample photo as fallback for mockup generation
  return "https://picsum.photos/seed/fotiqo/1200/800";
}

/**
 * POST /api/shop/mockup
 * Generate a product mockup with a customer's photo rendered ON the product.
 * Body: { productKey, photoUrl | photoId }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { productKey, photoUrl, photoId } = body as {
    productKey?: string;
    photoUrl?: string;
    photoId?: string;
  };

  if (!productKey) {
    return NextResponse.json({ error: "productKey required" }, { status: 400 });
  }

  const product = await prisma.shopProduct.findFirst({
    where: { productKey },
    select: { id: true, labProductId: true, labName: true, name: true, mockupUrl: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Non-Printful products: return static catalog image
  if (product.labName !== "PRINTFUL" || !product.labProductId) {
    return NextResponse.json({
      mockupUrl: product.mockupUrl || null,
      source: "static",
    });
  }

  // Resolve photo to a public URL Printful can access
  const publicUrl = await resolvePublicPhotoUrl(photoId || photoUrl || "");

  try {
    const mockupUrl = await generateProductMockup(
      product.labProductId,
      publicUrl,
    );

    if (mockupUrl) {
      return NextResponse.json({ mockupUrl, source: "printful" });
    }

    return NextResponse.json({
      mockupUrl: product.mockupUrl || null,
      source: "fallback",
    });
  } catch (e: any) {
    return NextResponse.json({
      mockupUrl: product.mockupUrl || null,
      source: "error",
      error: e.message,
    });
  }
}
