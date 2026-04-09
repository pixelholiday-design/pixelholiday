import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const original = await prisma.photoPackage.findUnique({
      where: { id },
      include: { addOns: true },
    });
    if (!original) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const newSlug = `${original.slug}-copy-${Date.now().toString(36)}`;

    const duplicate = await prisma.photoPackage.create({
      data: {
        name: `${original.name} (Copy)`,
        slug: newSlug,
        description: original.description,
        shortDescription: original.shortDescription,
        category: original.category,
        sessionType: original.sessionType,
        duration: original.duration,
        deliveredPhotos: original.deliveredPhotos,
        price: original.price,
        depositAmount: original.depositAmount,
        currency: original.currency,
        coverImage: original.coverImage,
        galleryImages: original.galleryImages,
        whatsIncluded: original.whatsIncluded,
        whatToBring: original.whatToBring,
        cancellationPolicy: original.cancellationPolicy,
        maxGroupSize: original.maxGroupSize,
        minGroupSize: original.minGroupSize,
        isFeatured: false,
        isActive: false, // Inactive until reviewed
        sortOrder: original.sortOrder + 1,
        locationId: original.locationId,
        addOns: {
          createMany: {
            data: original.addOns.map((a) => ({
              name: a.name,
              description: a.description,
              price: a.price,
              currency: a.currency,
              isDefault: a.isDefault,
              sortOrder: a.sortOrder,
            })),
          },
        },
      },
      include: { addOns: true },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error("Failed to duplicate package:", error);
    return NextResponse.json({ error: "Failed to duplicate package" }, { status: 500 });
  }
}
