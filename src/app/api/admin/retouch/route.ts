import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || "";
const HAS_CLOUDINARY = CLOUD && CLOUD !== "demo";

/** Build a Cloudinary delivery URL with transforms baked in (no re-upload needed). */
function buildRetouchedPublicId(cloudinaryId: string, transforms: string[]): string | null {
  if (!HAS_CLOUDINARY || !cloudinaryId || cloudinaryId.startsWith("uploads/")) return null;
  // Store the transform chain as a "named transformation" style public_id so the
  // URL can be reconstructed via cleanUrl(). We prefix with the transform string
  // so callers can resolve it to a full URL when needed.
  const transformStr = [...transforms, "q_85,f_auto"].join("/");
  return `${transformStr}/${cloudinaryId}`;
}

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

  const appliedTransforms = transforms.length > 0 ? transforms : [preset];

  // Apply Cloudinary transformation chain per photo and store the edited public_id
  const editedIds: Record<string, string> = {};
  if (HAS_CLOUDINARY) {
    const photos = await prisma.photo.findMany({
      where: { id: { in: photoIds } },
      select: { id: true, cloudinaryId: true },
    });
    for (const photo of photos) {
      if (photo.cloudinaryId) {
        const editedPublicId = buildRetouchedPublicId(photo.cloudinaryId, appliedTransforms);
        if (editedPublicId) editedIds[photo.id] = editedPublicId;
      }
    }
  }

  // Update each photo individually if we have an edited public_id, otherwise bulk update
  if (Object.keys(editedIds).length > 0) {
    await Promise.all(
      photoIds.map((id: string) =>
        prisma.photo.update({
          where: { id },
          data: {
            isRetouched: true,
            editApplied: appliedTransforms,
            isAutoEdited: true,
            ...(editedIds[id] ? { cloudinaryId_edited: editedIds[id] } : {}),
          },
        })
      )
    );
    return NextResponse.json({ updated: photoIds.length, preset, transforms: appliedTransforms });
  }

  const result = await prisma.photo.updateMany({
    where: { id: { in: photoIds } },
    data: {
      isRetouched: true,
      editApplied: appliedTransforms,
    },
  });

  return NextResponse.json({ updated: result.count, preset, transforms: appliedTransforms });
}
