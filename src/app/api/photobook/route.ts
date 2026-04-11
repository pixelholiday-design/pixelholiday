import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/photobook?galleryId=xxx — Load saved design
export async function GET(req: NextRequest) {
  const galleryId = req.nextUrl.searchParams.get("galleryId");
  if (!galleryId) {
    return NextResponse.json({ error: "galleryId required" }, { status: 400 });
  }

  const design = await prisma.photoBookDesign.findFirst({
    where: { galleryId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ design });
}

// POST /api/photobook — Create new design
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { galleryId, customerEmail, customerName, title, bookType, bookSize, paper, pages, coverDesign } = body;

  const design = await prisma.photoBookDesign.create({
    data: {
      galleryId: galleryId || null,
      customerEmail: customerEmail || null,
      customerName: customerName || null,
      title: title || "My Photo Book",
      bookType: bookType || "HARDCOVER",
      bookSize: bookSize || "8x11",
      paper: paper || "MATTE",
      pageCount: Array.isArray(pages) ? pages.length : 20,
      pages: pages || [],
      coverDesign: coverDesign || null,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ design }, { status: 201 });
}

// PUT /api/photobook — Update/save design (auto-save)
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, title, bookType, bookSize, paper, pages, coverDesign, status } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const design = await prisma.photoBookDesign.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(bookType !== undefined && { bookType }),
      ...(bookSize !== undefined && { bookSize }),
      ...(paper !== undefined && { paper }),
      ...(pages !== undefined && { pages, pageCount: Array.isArray(pages) ? pages.length : undefined }),
      ...(coverDesign !== undefined && { coverDesign }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json({ design });
}
