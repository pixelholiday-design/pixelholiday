import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const booking = await prisma.packageBooking.findUnique({
      where: { id },
      include: {
        package: { select: { name: true, slug: true, duration: true, deliveredPhotos: true, whatsIncluded: true, whatToBring: true, coverImage: true } },
        assignedPhotographer: { select: { id: true, name: true } },
        location: { select: { id: true, name: true, city: true, country: true, address: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Failed to fetch booking:", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}
