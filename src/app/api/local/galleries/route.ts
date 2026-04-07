import { NextResponse } from "next/server";
import { listLocalGalleries } from "@/lib/local-server";

// CORS open — gallery kiosks on the same LAN call this from a different IP.
const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "no-store",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: HEADERS });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locationId = url.searchParams.get("locationId");
  if (!locationId) {
    return NextResponse.json({ error: "locationId required" }, { status: 400, headers: HEADERS });
  }
  const galleries = await listLocalGalleries(locationId);
  // Strip server-only fields and pre-pick the edited cloudinaryId so kiosks
  // get already-edited images straight away.
  const slim = galleries.map((g) => ({
    id: g.id,
    magicLinkToken: g.magicLinkToken,
    status: g.status,
    customer: g.customer ? { name: g.customer.name } : null,
    photographer: { name: g.photographer.name },
    photos: g.photos.map((p) => ({
      id: p.id,
      cloudinaryId: p.cloudinaryId_edited || p.cloudinaryId,
      isFavorited: p.isFavorited,
      isPurchased: p.isPurchased,
      isHookImage: p.isHookImage,
      isAutoEdited: p.isAutoEdited,
    })),
  }));
  return NextResponse.json({ galleries: slim }, { headers: HEADERS });
}
