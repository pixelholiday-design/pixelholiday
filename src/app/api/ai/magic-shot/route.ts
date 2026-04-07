import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cloudinary } from "@/lib/cloudinary.server";

// Module 10: Magic Shots & AR — composite an overlay element onto a photo.
export async function POST(req: NextRequest) {
  const { photoId, magicElementId } = await req.json();
  if (!photoId || !magicElementId)
    return NextResponse.json({ error: "photoId and magicElementId required" }, { status: 400 });

  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  const element = await prisma.magicElement.findUnique({ where: { id: magicElementId } });
  if (!photo || !element)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  // Cloudinary overlay transformation
  let compositeUrl = "#";
  try {
    compositeUrl = cloudinary.url(photo.cloudinaryId || photo.s3Key_highRes, {
      transformation: [
        { overlay: element.assetUrl, gravity: "south_east", width: 300, opacity: 90 },
        { quality: "auto", fetch_format: "auto" },
      ],
    });
  } catch {}

  await prisma.photo.update({
    where: { id: photoId },
    data: { hasMagicElement: true, magicElementId },
  });

  return NextResponse.json({ ok: true, compositeUrl });
}
