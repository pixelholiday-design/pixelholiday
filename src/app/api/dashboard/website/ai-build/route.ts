import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Style-to-theme mapping
const STYLE_THEME_MAP: Record<string, { theme: string; color: string; font: string }> = {
  "Light & Airy": { theme: "light", color: "#0EA5A5", font: "inter" },
  "Dark & Moody": { theme: "dark", color: "#8B5CF6", font: "playfair" },
  "Classic & Timeless": { theme: "classic", color: "#92400E", font: "lora" },
  "Bold & Colorful": { theme: "bold", color: "#DC2626", font: "montserrat" },
  "Film-inspired": { theme: "minimal", color: "#78716C", font: "playfair" },
  "Minimalist": { theme: "minimal", color: "#171717", font: "inter" },
};

// Specialty-based tagline fallbacks
const SPECIALTY_TAGLINES: Record<string, string> = {
  Wedding: "Telling your love story, one frame at a time",
  Portrait: "Authentic portraits that reveal who you really are",
  Family: "Preserving your family's most precious moments",
  Event: "Professional event coverage you can count on",
  Commercial: "Elevating brands through powerful imagery",
  Newborn: "Tiny moments, lasting memories",
  Other: "Professional photography for every occasion",
};

// Specialty-based about text
function generateAbout(name: string, specialty: string, style: string, location: string): string {
  const loc = location ? ` based in ${location}` : "";
  const styleAdj: Record<string, string> = {
    "Light & Airy": "light, airy aesthetic that feels natural and effortless",
    "Dark & Moody": "dramatic, moody style that captures raw emotion",
    "Classic & Timeless": "timeless, classic approach that never goes out of style",
    "Bold & Colorful": "bold, vibrant style bursting with color and energy",
    "Film-inspired": "film-inspired look with rich tones and organic grain",
    "Minimalist": "clean, minimalist approach that lets the moment speak",
  };
  const adj = styleAdj[style] || "unique artistic vision";
  return `Hi, I'm ${name}, a ${specialty.toLowerCase()} photographer${loc}. I bring a ${adj} to every session. My goal is to create images that you'll treasure for years to come. Let's create something beautiful together.`;
}

// Specialty-based service packages
function generateServices(specialty: string): Array<{ name: string; description: string; price: string }> {
  const packages: Record<string, Array<{ name: string; description: string; price: string }>> = {
    Wedding: [
      { name: "Elopement", description: "Up to 2 hours of coverage, 100+ edited photos, online gallery", price: "800" },
      { name: "Half Day", description: "Up to 5 hours of coverage, 300+ edited photos, online gallery, engagement session", price: "1500" },
      { name: "Full Day", description: "Up to 10 hours of coverage, 600+ edited photos, online gallery, engagement session, second photographer", price: "2500" },
    ],
    Portrait: [
      { name: "Mini Session", description: "20-minute session, 10 edited photos, online gallery", price: "150" },
      { name: "Standard Session", description: "1-hour session, 30 edited photos, online gallery", price: "350" },
      { name: "Premium Session", description: "2-hour session, 50+ edited photos, 2 locations, online gallery", price: "600" },
    ],
    Family: [
      { name: "Mini Session", description: "30-minute session, 15 edited photos, online gallery", price: "200" },
      { name: "Family Session", description: "1-hour session, 40 edited photos, online gallery", price: "400" },
      { name: "Extended Family", description: "2-hour session, 80+ edited photos, multiple groupings, online gallery", price: "700" },
    ],
    Event: [
      { name: "Hourly Coverage", description: "Per-hour event coverage, edited highlights, online gallery", price: "250" },
      { name: "Half Day Event", description: "Up to 4 hours of coverage, 200+ edited photos", price: "800" },
      { name: "Full Day Event", description: "Up to 8 hours of coverage, 500+ edited photos, highlights reel", price: "1500" },
    ],
    Commercial: [
      { name: "Product Shoot", description: "Up to 10 products, white background, 3 angles each", price: "500" },
      { name: "Brand Session", description: "Half-day shoot, lifestyle & product shots, 50+ edited images", price: "1200" },
      { name: "Full Campaign", description: "Full-day shoot, art direction, 100+ edited images, usage rights", price: "3000" },
    ],
    Newborn: [
      { name: "Simple Session", description: "1-hour session at home, 15 edited photos, online gallery", price: "250" },
      { name: "Studio Session", description: "2-hour studio session, props & setups, 30+ edited photos", price: "450" },
      { name: "Milestone Bundle", description: "3 sessions (newborn, 6-month, 1-year), 25 photos each", price: "900" },
    ],
    Other: [
      { name: "Basic Package", description: "1-hour session, 20 edited photos, online gallery", price: "200" },
      { name: "Standard Package", description: "2-hour session, 50 edited photos, online gallery", price: "450" },
      { name: "Premium Package", description: "Half-day session, 100+ edited photos, online gallery, prints", price: "800" },
    ],
  };
  return packages[specialty] || packages["Other"];
}

// Placeholder testimonials
function generateTestimonials(specialty: string): Array<{ name: string; text: string }> {
  const adj = specialty === "Wedding" ? "wedding" : specialty === "Newborn" ? "newborn" : "photo";
  return [
    { name: "Sarah M.", text: `Absolutely amazing experience! The photos exceeded all our expectations. Every ${adj} session felt natural and fun.` },
    { name: "James & Lisa K.", text: "We couldn't be happier with how the images turned out. True artistry and a wonderful eye for detail." },
    { name: "Rebecca T.", text: "Professional, creative, and so easy to work with. The gallery was delivered quickly and every photo was stunning." },
  ];
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const body = await req.json();
  const {
    name,
    businessName,
    specialty = "Other",
    style = "Minimalist",
    location = {},
    tagline,
    colorPreference,
  } = body;

  if (!name || !businessName) {
    return NextResponse.json({ error: "Name and business name are required" }, { status: 400 });
  }

  // Resolve theme settings
  const themeDefaults = STYLE_THEME_MAP[style] || STYLE_THEME_MAP["Minimalist"];
  const primaryColor = colorPreference && colorPreference !== "auto" ? colorPreference : themeDefaults.color;

  // Upsert photographer profile
  const usernameSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 40);

  // Check if username exists for another user
  const existing = await prisma.photographerProfile.findUnique({ where: { username: usernameSlug } });
  const finalUsername = existing && existing.userId !== userId
    ? `${usernameSlug}-${Date.now().toString(36)}`
    : usernameSlug;

  const locationStr = [location.city, location.country].filter(Boolean).join(", ");
  const finalTagline = tagline || SPECIALTY_TAGLINES[specialty] || SPECIALTY_TAGLINES["Other"];
  const aboutText = generateAbout(name, specialty, style, locationStr);
  const services = generateServices(specialty);
  const testimonials = generateTestimonials(specialty);

  const profile = await prisma.photographerProfile.upsert({
    where: { userId },
    update: {
      businessName,
      tagline: finalTagline,
      bio: aboutText,
      city: location.city || undefined,
      country: location.country || undefined,
      specialties: [specialty.toLowerCase()],
      websiteTheme: themeDefaults.theme,
      primaryColor,
      fontChoice: themeDefaults.font,
      isPublicProfile: true,
    },
    create: {
      userId,
      username: finalUsername,
      businessName,
      tagline: finalTagline,
      bio: aboutText,
      city: location.city || null,
      country: location.country || null,
      specialties: [specialty.toLowerCase()],
      websiteTheme: themeDefaults.theme,
      primaryColor,
      fontChoice: themeDefaults.font,
      isPublicProfile: true,
    },
  });

  // Fetch existing gallery photos for the gallery grid block
  const galleries = await prisma.gallery.findMany({
    where: { photographerId: userId },
    include: { photos: { take: 2, orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const galleryPhotos = galleries.flatMap((g) =>
    g.photos.map((p) => ({
      galleryId: g.id,
      photoId: p.id,
      cloudinaryId: p.cloudinaryId,
      s3Key: p.s3Key_highRes,
    }))
  ).slice(0, 12);

  // Delete existing blocks for "home" page
  await prisma.websiteBlock.deleteMany({
    where: { profileId: profile.id, pageSlug: "home" },
  });

  // Create blocks
  const blocksToCreate = [
    {
      profileId: profile.id,
      pageSlug: "home",
      type: "HERO" as const,
      sortOrder: 0,
      content: {
        title: businessName,
        subtitle: finalTagline,
        buttonText: "View My Work",
        buttonLink: "#gallery",
      },
      settings: {
        style,
        overlay: style === "Dark & Moody" ? 0.6 : 0.3,
      },
    },
    {
      profileId: profile.id,
      pageSlug: "home",
      type: "ABOUT" as const,
      sortOrder: 1,
      content: {
        heading: `About ${name}`,
        body: aboutText,
        location: locationStr || null,
        specialty,
      },
      settings: {},
    },
    {
      profileId: profile.id,
      pageSlug: "home",
      type: "GALLERY_GRID" as const,
      sortOrder: 2,
      content: {
        heading: "Portfolio",
        photos: galleryPhotos,
        layout: "masonry",
      },
      settings: { columns: 3 },
    },
    {
      profileId: profile.id,
      pageSlug: "home",
      type: "SERVICES" as const,
      sortOrder: 3,
      content: {
        heading: "Packages & Pricing",
        currency: "EUR",
        packages: services.map((s, i) => ({
          name: s.name,
          description: s.description,
          price: s.price,
          sortOrder: i,
        })),
      },
      settings: {},
    },
    {
      profileId: profile.id,
      pageSlug: "home",
      type: "TESTIMONIALS" as const,
      sortOrder: 4,
      content: {
        heading: "What Clients Say",
        items: testimonials.map((t, i) => ({
          clientName: t.name,
          text: t.text,
          rating: 5,
          sortOrder: i,
        })),
      },
      settings: {},
    },
    {
      profileId: profile.id,
      pageSlug: "home",
      type: "CONTACT_FORM" as const,
      sortOrder: 5,
      content: {
        heading: "Get In Touch",
        description: `Interested in booking a ${specialty.toLowerCase()} session? Fill out the form below and I'll get back to you within 24 hours.`,
        fields: ["name", "email", "date", "message"],
      },
      settings: {},
    },
    {
      profileId: profile.id,
      pageSlug: "home",
      type: "CTA" as const,
      sortOrder: 6,
      content: {
        heading: "Ready to Book Your Session?",
        description: "Limited availability. Secure your date today.",
        buttonText: "Book Now",
        buttonLink: "#contact",
      },
      settings: {},
    },
  ];

  const created = [];
  for (const block of blocksToCreate) {
    const b = await prisma.websiteBlock.create({ data: block });
    created.push(b);
  }

  return NextResponse.json({
    username: profile.username,
    profileId: profile.id,
    blocksCreated: created.length,
    blocks: created,
  });
}
