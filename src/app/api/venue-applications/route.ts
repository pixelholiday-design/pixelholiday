import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  venueType: z.string().min(1),
  venueCount: z.string().min(1),
  country: z.string().min(1),
  city: z.string().optional(),
  estimatedRevenue: z.string().optional(),
  currentSetup: z.string().optional(),
  websiteUrl: z.string().optional(),
  message: z.string().optional(),
});

/** POST /api/venue-applications — Public: submit a venue application */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const app = await prisma.venueApplication.create({ data: parsed.data });

  // Send emails (non-blocking)
  try {
    const { emailGalleryLink } = await import("@/lib/email");
    await emailGalleryLink(parsed.data.email, "https://fotiqo.com/for/attractions-and-resorts");
  } catch {}

  return NextResponse.json({ ok: true, id: app.id, message: "Application received! We'll contact you within 1-3 business days." });
}

/** GET /api/venue-applications — Admin: list applications */
export async function GET() {
  const apps = await prisma.venueApplication.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const stats = {
    total: apps.length,
    new: apps.filter((a) => a.status === "NEW").length,
    reviewing: apps.filter((a) => a.status === "REVIEWING").length,
    approved: apps.filter((a) => a.status === "APPROVED").length,
    active: apps.filter((a) => a.status === "ACTIVE").length,
  };
  return NextResponse.json({ applications: apps, stats });
}
