import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  groupSize: z.number().int().min(1).max(50).optional(),
  specialOccasion: z.enum(["anniversary", "birthday", "honeymoon", "family_reunion", "none"]).optional(),
  preferredStyle: z.enum(["casual", "formal", "fun", "romantic", "adventure"]).optional(),
  comfortLevel: z.enum(["very_comfortable", "a_bit_shy", "first_time"]).optional(),
  waterComfort: z.enum(["loves_water", "prefers_dry", "cant_swim"]).optional(),
  specialRequests: z.string().max(1000).optional(),
});

/** GET — return existing questionnaire data */
export async function GET(_req: Request, { params }: { params: { appointmentId: string } }) {
  const { appointmentId } = params;

  // Verify appointment exists
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true },
  });
  if (!appointment) {
    return NextResponse.json({ ok: false, error: "Appointment not found" }, { status: 404 });
  }

  const questionnaire = await prisma.sessionQuestionnaire.findUnique({
    where: { appointmentId },
  });

  return NextResponse.json({ ok: true, data: questionnaire });
}

/** POST — create or update questionnaire */
export async function POST(req: Request, { params }: { params: { appointmentId: string } }) {
  const { appointmentId } = params;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Verify appointment exists
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true },
  });
  if (!appointment) {
    return NextResponse.json({ ok: false, error: "Appointment not found" }, { status: 404 });
  }

  const data = {
    groupSize: parsed.data.groupSize ?? null,
    specialOccasion: parsed.data.specialOccasion ?? null,
    preferredStyle: parsed.data.preferredStyle ?? null,
    comfortLevel: parsed.data.comfortLevel ?? null,
    waterComfort: parsed.data.waterComfort ?? null,
    specialRequests: parsed.data.specialRequests ?? null,
    answeredAt: new Date(),
  };

  const questionnaire = await prisma.sessionQuestionnaire.upsert({
    where: { appointmentId },
    update: data,
    create: { appointmentId, ...data },
  });

  return NextResponse.json({ ok: true, id: questionnaire.id });
}
