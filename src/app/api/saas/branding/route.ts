import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/saas/branding?orgId=X
 * Returns the franchise/org brand settings from the Organization model.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true, brandColor: true, logoUrl: true, tagline: true, customDomain: true },
  });
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  return NextResponse.json({
    orgId: org.id,
    name: org.name,
    brandColor: org.brandColor || "#29ABE2",
    logoUrl: org.logoUrl || null,
    tagline: org.tagline || null,
    customDomain: org.customDomain || null,
  });
}

/**
 * PUT /api/saas/branding
 * Updates franchise brand settings (color, logo, tagline, custom domain).
 */
export async function PUT(req: Request) {
  try {
    const { orgId, brandColor, logoUrl, tagline, customDomain } = await req.json();
    if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(brandColor !== undefined && { brandColor }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(tagline !== undefined && { tagline }),
        ...(customDomain !== undefined && { customDomain }),
      },
      select: { id: true, name: true, brandColor: true, logoUrl: true, tagline: true, customDomain: true },
    });

    return NextResponse.json({ ok: true, branding: org });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Keep POST for backwards compatibility
export async function POST(req: Request) {
  return PUT(req);
}
