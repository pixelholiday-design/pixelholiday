import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    // List all galleries with their tokens
    const galleries = await prisma.gallery.findMany({
      select: { id: true, magicLinkToken: true, status: true, totalCount: true, photos: { select: { id: true, s3Key_highRes: true, isHookImage: true }, take: 2 } },
      take: 15,
    });
    return NextResponse.json({ galleries });
  }

  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: token },
    include: {
      photos: { select: { id: true, s3Key_highRes: true, cloudinaryId: true, isHookImage: true }, take: 5 },
      location: { select: { name: true } },
      photographer: { select: { name: true } },
    },
  });

  return NextResponse.json({ gallery });
}
