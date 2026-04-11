import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase() || "";
  const code = url.searchParams.get("code")?.trim().toUpperCase() || "";
  const name = url.searchParams.get("name")?.trim().toLowerCase() || "";
  const phone = url.searchParams.get("phone")?.trim() || "";

  if (!email && !code && !name && !phone) {
    return NextResponse.json({ error: "At least one search parameter is required" }, { status: 400 });
  }

  // Find photographer profile
  const profile = await prisma.photographerProfile.findUnique({
    where: { username },
    select: { userId: true, user: { select: { orgId: true } } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Photographer not found" }, { status: 404 });
  }

  const orgId = profile.user.orgId;

  // Build gallery search conditions -- only galleries belonging to this photographer's organization
  const conditions: any[] = [
    {
      photographer: { orgId },
    },
  ];

  // Search filters (OR logic across provided params)
  const searchOr: any[] = [];

  if (email) {
    searchOr.push({ customer: { email: { equals: email, mode: "insensitive" } } });
  }
  if (code) {
    searchOr.push({ galleryCode: code });
  }
  if (name) {
    searchOr.push({ customer: { name: { contains: name, mode: "insensitive" } } });
  }
  if (phone) {
    searchOr.push({ customer: { whatsapp: { contains: phone } } });
  }

  if (searchOr.length === 0) {
    return NextResponse.json({ galleries: [] });
  }

  const galleries = await prisma.gallery.findMany({
    where: {
      AND: [
        { photographer: { orgId } },
        { OR: searchOr },
      ],
    },
    select: {
      id: true,
      magicLinkToken: true,
      galleryCode: true,
      createdAt: true,
      totalCount: true,
      roomNumber: true,
      customer: { select: { name: true } },
      photos: {
        take: 1,
        orderBy: { sortOrder: "asc" },
        where: { isHookImage: true },
        select: { cloudinaryId: true, s3Key_highRes: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // If no hook image found, try first photo
  const results = await Promise.all(
    galleries.map(async (g) => {
      let coverPhoto: { cloudinaryId: string | null; s3Key_highRes: string } | null = g.photos[0] || null;
      if (!coverPhoto) {
        coverPhoto = await prisma.photo.findFirst({
          where: { galleryId: g.id },
          orderBy: { sortOrder: "asc" },
          select: { cloudinaryId: true, s3Key_highRes: true },
        });
      }

      // Build cover URL (watermarked for security)
      let coverImageUrl: string | null = null;
      if (coverPhoto?.cloudinaryId) {
        coverImageUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || "demo"}/image/upload/w_400,h_300,c_fill,q_60,f_webp/${coverPhoto.cloudinaryId}`;
      }

      const customerName = g.customer?.name || "";
      const title = customerName
        ? `${customerName}'s Gallery`
        : g.galleryCode
        ? `Gallery ${g.galleryCode}`
        : `Gallery`;

      return {
        title,
        photoCount: g.totalCount,
        date: g.createdAt.toISOString(),
        coverImageUrl,
        galleryLink: `/gallery/${g.magicLinkToken}`,
      };
    })
  );

  return NextResponse.json({ galleries: results });
}
