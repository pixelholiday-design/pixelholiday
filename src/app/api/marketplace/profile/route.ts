import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const profile = await prisma.photographerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        services: { orderBy: { sortOrder: "asc" } },
        reviews: {
          where: { isPublic: true },
          select: { id: true },
        },
        bookings: {
          select: { id: true },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { reviews, bookings, ...profileData } = profile;

    return NextResponse.json({
      profile: {
        ...profileData,
        reviewsCount: reviews.length,
        bookingsCount: bookings.length,
      },
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Ensure the profile belongs to the authenticated user
    const existingProfile = await prisma.photographerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found for this user" }, { status: 404 });
    }

    // Allowlisted fields for update
    const allowedFields: Record<string, boolean> = {
      businessName: true,
      tagline: true,
      bio: true,
      profilePhotoUrl: true,
      coverPhotoUrl: true,
      specialties: true,
      experience: true,
      equipment: true,
      languages: true,
      city: true,
      country: true,
      latitude: true,
      longitude: true,
      serviceAreaKm: true,
      priceRange: true,
      hourlyRate: true,
      responseTime: true,
      socialInstagram: true,
      socialFacebook: true,
      socialWebsite: true,
      socialTiktok: true,
      isPublicProfile: true,
      websiteTheme: true,
      primaryColor: true,
      fontChoice: true,
      logoUrl: true,
      sections: true,
      customDomain: true,
      seoTitle: true,
      seoDescription: true,
      seoImage: true,
      featuredGalleryIds: true,
    };

    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields[key]) {
        data[key] = value;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.photographerProfile.update({
      where: { userId: session.user.id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        services: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
