import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    select: { id: true, shortCode: true, magicLinkToken: true },
  });

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  }

  // Return existing short code if already generated
  if (gallery.shortCode) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    return NextResponse.json({
      ok: true,
      shortCode: gallery.shortCode,
      shortUrl: `${appUrl}/g/${gallery.shortCode}`,
      fullUrl: `${appUrl}/gallery/${gallery.magicLinkToken}`,
    });
  }

  // Generate new 8-character short code
  const shortCode = nanoid(8);
  await prisma.gallery.update({
    where: { id: gallery.id },
    data: { shortCode },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return NextResponse.json({
    ok: true,
    shortCode,
    shortUrl: `${appUrl}/g/${shortCode}`,
    fullUrl: `${appUrl}/gallery/${gallery.magicLinkToken}`,
  });
}
