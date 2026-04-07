import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Module 13: Apply retouch preset to one or many photos via Cloudinary transforms.
export async function POST(req: NextRequest) {
  const { photoIds = [], preset = "auto-color" } = await req.json();
  if (!photoIds.length) return NextResponse.json({ error: "photoIds required" }, { status: 400 });

  // In production: apply Cloudinary transformation chain per preset
  // e.g. e_auto_color, e_auto_brightness, e_auto_contrast, e_improve, e_gen_remove
  const result = await prisma.photo.updateMany({
    where: { id: { in: photoIds } },
    data: { isRetouched: true },
  });

  return NextResponse.json({ updated: result.count, preset });
}
