import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const packages = await prisma.photoPackage.findMany({
      include: {
        addOns: { orderBy: { sortOrder: "asc" } },
        _count: { select: { bookings: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    // Calculate revenue per package
    const withStats = await Promise.all(
      packages.map(async (pkg) => {
        const revenue = await prisma.packageBooking.aggregate({
          where: { packageId: pkg.id, isPaid: true },
          _sum: { totalPrice: true },
        });
        return {
          ...pkg,
          totalBookings: pkg._count.bookings,
          totalRevenue: revenue._sum.totalPrice || 0,
        };
      }),
    );

    return NextResponse.json(withStats);
  } catch (error) {
    console.error("Failed to list packages:", error);
    return NextResponse.json({ error: "Failed to list packages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, slug, description, shortDescription, category, sessionType,
      duration, deliveredPhotos, price, depositAmount, currency,
      coverImage, galleryImages, whatsIncluded, whatToBring,
      cancellationPolicy, maxGroupSize, minGroupSize, isFeatured,
      sortOrder, locationId, addOns,
    } = body;

    if (!name || !slug || !description || !category || !duration || !deliveredPhotos || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pkg = await prisma.photoPackage.create({
      data: {
        name,
        slug,
        description,
        shortDescription: shortDescription || null,
        category,
        sessionType: sessionType || "MIXED",
        duration,
        deliveredPhotos,
        price,
        depositAmount: depositAmount || null,
        currency: currency || "EUR",
        coverImage: coverImage || null,
        galleryImages: galleryImages || [],
        whatsIncluded: whatsIncluded || [],
        whatToBring: whatToBring || [],
        cancellationPolicy: cancellationPolicy || null,
        maxGroupSize: maxGroupSize || 6,
        minGroupSize: minGroupSize || 1,
        isFeatured: isFeatured || false,
        sortOrder: sortOrder || 0,
        locationId: locationId || null,
        addOns: addOns?.length
          ? { createMany: { data: addOns } }
          : undefined,
      },
      include: { addOns: true },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A package with this slug already exists" }, { status: 409 });
    }
    console.error("Failed to create package:", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
