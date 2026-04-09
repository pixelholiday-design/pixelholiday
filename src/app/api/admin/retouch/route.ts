import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Module 13: Apply retouch preset / adjustments to photos via Cloudinary transforms.
export async function POST(req: NextRequest) {
  const { photoIds = [], preset = "auto-color", adjustments } = await req.json();
  if (!photoIds.length) return NextResponse.json({ error: "photoIds required" }, { status: 400 });

  // Build Cloudinary transformation chain from adjustments
  const transforms: string[] = [];
  if (adjustments) {
    if (adjustments.brightness) transforms.push(`e_brightness:${adjustments.brightness}`);
    if (adjustments.contrast) transforms.push(`e_contrast:${adjustments.contrast}`);
    if (adjustments.saturation) transforms.push(`e_saturation:${adjustments.saturation}`);
    if (adjustments.skinSmooth) transforms.push("e_improve:indoor:50");
    if (adjustments.bgBlur) transforms.push("e_background_removal");
  } else {
    // Legacy preset-based transforms
    switch (preset) {
      case "auto-color": transforms.push("e_auto_color"); break;
      case "exposure": transforms.push("e_auto_brightness"); break;
      case "white-balance": transforms.push("e_auto_color", "e_auto_brightness"); break;
      case "skin-smoothing": transforms.push("e_improve:indoor:50"); break;
      case "batch-portrait": transforms.push("e_auto_color", "e_improve:outdoor:30", "e_auto_brightness"); break;
    }
  }

  // In production: apply Cloudinary transformation chain per photo
  // const cloudinary = require('cloudinary').v2;
  // for (const id of photoIds) {
  //   const photo = await prisma.photo.findUnique({ where: { id } });
  //   if (photo?.cloudinaryId) {
  //     const editedUrl = cloudinary.url(photo.cloudinaryId, { transformation: transforms.join('/') });
  //     const uploaded = await cloudinary.uploader.upload(editedUrl, { folder: 'pixelholiday/retouched' });
  //     await prisma.photo.update({ where: { id }, data: { cloudinaryId_edited: uploaded.public_id, isRetouched: true, editApplied: transforms } });
  //   }
  // }

  const result = await prisma.photo.updateMany({
    where: { id: { in: photoIds } },
    data: {
      isRetouched: true,
      editApplied: transforms.length > 0 ? transforms : [preset],
    },
  });

  return NextResponse.json({ updated: result.count, preset, transforms });
}
