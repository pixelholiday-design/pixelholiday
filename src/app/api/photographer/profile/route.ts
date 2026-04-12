import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const profile = await prisma.photographerProfile.findUnique({
    where: { userId },
    include: { services: { orderBy: { sortOrder: "asc" } }, testimonials: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const data = await req.json();

  // Validate username uniqueness
  if (data.username) {
    const slug = data.username.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (slug.length < 3) return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    const existing = await prisma.photographerProfile.findUnique({ where: { username: slug } });
    if (existing && existing.userId !== userId) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    data.username = slug;
  }

  const profile = await prisma.photographerProfile.upsert({
    where: { userId },
    create: {
      userId,
      username: data.username || userId.slice(0, 8),
      businessName: data.businessName,
      tagline: data.tagline,
      bio: data.bio,
      profilePhotoUrl: data.profilePhotoUrl,
      coverPhotoUrl: data.coverPhotoUrl,
      specialties: data.specialties || [],
      experience: data.experience,
      equipment: data.equipment || [],
      languages: data.languages || [],
      city: data.city,
      country: data.country,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      serviceAreaKm: data.serviceAreaKm ? parseInt(data.serviceAreaKm) : null,
      priceRange: data.priceRange,
      socialInstagram: data.socialInstagram,
      socialFacebook: data.socialFacebook,
      socialWebsite: data.socialWebsite,
      socialTiktok: data.socialTiktok,
      isPublicProfile: data.isPublicProfile ?? true,
      websiteTheme: data.websiteTheme || "minimal",
      primaryColor: data.primaryColor || "#0EA5A5",
      fontChoice: data.fontChoice || "inter",
      logoUrl: data.logoUrl,
      sections: data.sections ? JSON.stringify(data.sections) : undefined,
      customDomain: data.customDomain || null,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      seoImage: data.seoImage,
      featuredGalleryIds: data.featuredGalleryIds || [],
      whatsappEnabled: data.whatsappEnabled ?? false,
      whatsappNumber: data.whatsappNumber || null,
      whatsappMessage: data.whatsappMessage || null,
      whatsappPosition: data.whatsappPosition || "bottom-right",
    },
    update: {
      ...(data.username !== undefined && { username: data.username }),
      ...(data.businessName !== undefined && { businessName: data.businessName }),
      ...(data.tagline !== undefined && { tagline: data.tagline }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.profilePhotoUrl !== undefined && { profilePhotoUrl: data.profilePhotoUrl }),
      ...(data.coverPhotoUrl !== undefined && { coverPhotoUrl: data.coverPhotoUrl }),
      ...(data.specialties !== undefined && { specialties: data.specialties }),
      ...(data.experience !== undefined && { experience: data.experience }),
      ...(data.equipment !== undefined && { equipment: data.equipment }),
      ...(data.languages !== undefined && { languages: data.languages }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.latitude !== undefined && { latitude: data.latitude ? parseFloat(data.latitude) : null }),
      ...(data.longitude !== undefined && { longitude: data.longitude ? parseFloat(data.longitude) : null }),
      ...(data.serviceAreaKm !== undefined && { serviceAreaKm: data.serviceAreaKm ? parseInt(data.serviceAreaKm) : null }),
      ...(data.priceRange !== undefined && { priceRange: data.priceRange }),
      ...(data.socialInstagram !== undefined && { socialInstagram: data.socialInstagram }),
      ...(data.socialFacebook !== undefined && { socialFacebook: data.socialFacebook }),
      ...(data.socialWebsite !== undefined && { socialWebsite: data.socialWebsite }),
      ...(data.socialTiktok !== undefined && { socialTiktok: data.socialTiktok }),
      ...(data.isPublicProfile !== undefined && { isPublicProfile: data.isPublicProfile }),
      ...(data.websiteTheme !== undefined && { websiteTheme: data.websiteTheme }),
      ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
      ...(data.fontChoice !== undefined && { fontChoice: data.fontChoice }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.sections !== undefined && { sections: JSON.stringify(data.sections) }),
      ...(data.customDomain !== undefined && { customDomain: data.customDomain || null }),
      ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
      ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
      ...(data.seoImage !== undefined && { seoImage: data.seoImage }),
      ...(data.featuredGalleryIds !== undefined && { featuredGalleryIds: data.featuredGalleryIds }),
      ...(data.whatsappEnabled !== undefined && { whatsappEnabled: data.whatsappEnabled }),
      ...(data.whatsappNumber !== undefined && { whatsappNumber: data.whatsappNumber || null }),
      ...(data.whatsappMessage !== undefined && { whatsappMessage: data.whatsappMessage || null }),
      ...(data.whatsappPosition !== undefined && { whatsappPosition: data.whatsappPosition }),
    },
    include: { services: { orderBy: { sortOrder: "asc" } }, testimonials: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ profile });
}
