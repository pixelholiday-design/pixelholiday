import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/companies/[slug] -- Public: get company branding for login page */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const company = await prisma.organization.findFirst({
    where: { slug: params.slug, type: { in: ["VENUE_COMPANY", "HEADQUARTERS", "FRANCHISE"] } },
    select: {
      id: true, name: true, slug: true, type: true,
      brandName: true, brandLogo: true, brandLogoDark: true,
      brandPrimaryColor: true, brandSecondaryColor: true,
      brandFavicon: true, showPoweredByFotiqo: true,
      logoUrl: true,
    },
  });
  if (!company) return NextResponse.json({ company: null }, { status: 404 });
  return NextResponse.json({ company });
}
