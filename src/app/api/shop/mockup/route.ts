import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateProductMockup } from "@/lib/fulfillment/printful-mockups";

export const dynamic = "force-dynamic";

/**
 * POST /api/shop/mockup
 * Generate a product mockup with a customer's photo rendered ON the product.
 * Uses Printful Mockup Generator API.
 *
 * Body: { productKey: string, photoUrl: string }
 * Returns: { mockupUrl: string } or { error: string }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { productKey, photoUrl } = body as { productKey?: string; photoUrl?: string };

  if (!productKey || !photoUrl) {
    return NextResponse.json({ error: "productKey and photoUrl required" }, { status: 400 });
  }

  // Find the product
  const product = await prisma.shopProduct.findFirst({
    where: { productKey },
    select: { id: true, labProductId: true, labName: true, name: true, mockupUrl: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Only Printful products can generate mockups
  if (product.labName !== "PRINTFUL" || !product.labProductId) {
    // Return the static mockup URL if available, otherwise null
    return NextResponse.json({
      mockupUrl: product.mockupUrl || null,
      source: "static",
    });
  }

  // Ensure photoUrl is absolute
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fotiqo.com";
  const absolutePhotoUrl = photoUrl.startsWith("http") ? photoUrl : baseUrl + photoUrl;

  try {
    const mockupUrl = await generateProductMockup(
      product.labProductId,
      absolutePhotoUrl,
    );

    if (mockupUrl) {
      return NextResponse.json({ mockupUrl, source: "printful" });
    }

    // Fallback to static mockup
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
