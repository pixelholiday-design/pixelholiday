export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { BookingSource } from "@prisma/client";

const schema = z.object({
  source: z.enum([
    "HOOK_GALLERY",
    "QR_CODE",
    "VIP_BOOKING",
    "WALK_IN",
    "PRE_ARRIVAL",
    "WEBSITE",
    "INSTAGRAM",
    "FACEBOOK",
    "EMAIL",
    "PHONE",
    "WHATSAPP",
    "HOTEL_CONCIERGE",
    "PARTNER_REFERRAL",
  ]),
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  sessionType: z
    .enum(["STANDARD", "SUNSET", "VIP", "FAMILY", "ROMANTIC", "GROUP"])
    .default("STANDARD"),
  preferredDate: z.string().min(1), // YYYY-MM-DD
  preferredTime: z.string().min(1), // HH:mm
  partySize: z.coerce.number().int().min(1).max(50).default(1),
  locationName: z.string().optional(),
  specialRequests: z.string().optional(),
  externalRef: z.string().optional(),
  notes: z.string().optional(),
  estimatedDuration: z.coerce.number().int().optional(),
});

export async function POST(req: Request) {
  // Simple header-based API key check (optional in dev)
  const envKey = process.env.BOOKING_API_KEY;
  if (envKey) {
    const provided = req.headers.get("x-booking-api-key");
    if (provided !== envKey) {
      return NextResponse.json({ ok: false, error: "Invalid API key" }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  try {
    // Merge preferredDate + preferredTime → scheduledTime
    const scheduledTime = new Date(`${data.preferredDate}T${data.preferredTime}:00`);
    if (isNaN(scheduledTime.getTime())) {
      return NextResponse.json(
        { ok: false, error: "Invalid preferredDate/preferredTime" },
        { status: 400 }
      );
    }

    // Resolve location by fuzzy name match
    let locationId: string | null = null;
    if (data.locationName) {
      const location = await prisma.location.findFirst({
        where: { name: { contains: data.locationName, mode: "insensitive" } },
      });
      if (location) locationId = location.id;
    }

    // Pick a default photographer for this location
    let photographerId: string | null = null;
    if (locationId) {
      const photog = await prisma.user.findFirst({
        where: { role: "PHOTOGRAPHER", locationId },
      });
      if (photog) photographerId = photog.id;
    }
    if (!photographerId) {
      const anyPhotog = await prisma.user.findFirst({
        where: { role: "PHOTOGRAPHER" },
      });
      if (anyPhotog) photographerId = anyPhotog.id;
    }
    if (!photographerId) {
      return NextResponse.json(
        { ok: false, error: "No photographer available to assign" },
        { status: 503 }
      );
    }

    // Create or find customer
    let customer = null as Awaited<ReturnType<typeof prisma.customer.findFirst>>;
    if (data.customerEmail) {
      customer = await prisma.customer.findFirst({
        where: { email: data.customerEmail },
      });
    }
    if (!customer && data.customerPhone) {
      customer = await prisma.customer.findFirst({
        where: { whatsapp: data.customerPhone },
      });
    }
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.customerName,
          email: data.customerEmail || null,
          whatsapp: data.customerPhone || null,
          locationId: locationId || undefined,
        },
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        status: "PENDING",
        scheduledTime,
        source: data.source as BookingSource,
        sourceDetail: data.externalRef || null,
        externalRef: data.externalRef || null,
        notes: data.notes || null,
        customerName: data.customerName,
        customerPhone: data.customerPhone || null,
        customerEmail: data.customerEmail || null,
        partySize: data.partySize,
        sessionType: data.sessionType,
        estimatedDuration: data.estimatedDuration || 30,
        specialRequests: data.specialRequests || null,
        locationId: locationId || undefined,
        assignedPhotographerId: photographerId,
      },
    });

    const confirmationCode = appointment.id.slice(-6).toUpperCase();

    return NextResponse.json({
      ok: true,
      appointmentId: appointment.id,
      confirmationCode,
      scheduledTime: appointment.scheduledTime,
      customerId: customer.id,
    });
  } catch (e: any) {
    console.error("external booking create error", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}
