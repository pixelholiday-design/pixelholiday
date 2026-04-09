import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const profileId = req.nextUrl.searchParams.get("profileId");
    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const reviews = await prisma.photographerReview.findMany({
      where: { profileId, isPublic: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      profileId,
      photographerId,
      bookingId,
      customerName,
      customerEmail,
      rating,
      title,
      comment,
      photoUrls,
    } = body;

    if (!profileId || !photographerId || !customerName || !rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields: profileId, photographerId, customerName, rating, comment" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Check if bookingId is valid for verified status
    let isVerified = false;
    if (bookingId) {
      const booking = await prisma.marketplaceBooking.findUnique({
        where: { id: bookingId },
      });
      if (booking && booking.profileId === profileId && booking.photographerId === photographerId) {
        isVerified = true;
      }
    }

    const review = await prisma.photographerReview.create({
      data: {
        profileId,
        photographerId,
        bookingId: bookingId || null,
        customerName,
        customerEmail: customerEmail || null,
        rating,
        title: title || null,
        comment,
        photoUrls: photoUrls || [],
        isVerified,
      },
    });

    // Recalculate profile averageRating and totalReviews
    const stats = await prisma.photographerReview.aggregate({
      where: { profileId, isPublic: true },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.photographerProfile.update({
      where: { id: profileId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count,
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
