import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "no-store",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: HEADERS });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  // Accept either the internal id OR the magicLinkToken so the kiosk can use
  // whichever it has.
  const gallery = await prisma.gallery.findFirst({
    where: { OR: [{ id: params.id }, { magicLinkToken: params.id }] },
    include: {
      customer: { select: { id: true, name: true, roomNumber: true } },
      photographer: { select: { id: true, name: true } },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!gallery) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: HEADERS });
  }

  return NextResponse.json(
    {
      id: gallery.id,
      magicLinkToken: gallery.magicLinkToken,
      status: gallery.status,
      coverMessage: gallery.coverMessage,
      customer: gallery.customer,
      photographer: gallery.photographer,
      photos: gallery.photos.map((p) => ({
        id: p.id,
        // Direct local-disk URL — gallery kiosks fetch this and the response
        // streams the bytes off the sale-kiosk SSD.
        url: `/api/local/photo/${p.id}/file`,
        cloudinaryId: p.cloudinaryId_edited || p.cloudinaryId,
        isFavorited: p.isFavorited,
        isPurchased: p.isPurchased,
        isHookImage: p.isHookImage,
      })),
    },
    { headers: HEADERS }
  );
}
