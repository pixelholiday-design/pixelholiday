import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/hotel/availability?locationId=X&date=YYYY-MM-DD
 * Returns available session time slots for a given location and date.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const dateStr = searchParams.get("date");

  if (!locationId || !dateStr) {
    return NextResponse.json({ error: "locationId and date required" }, { status: 400 });
  }

  const location = await prisma.location.findUnique({ where: { id: locationId } });
  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const date = new Date(dateStr);
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Get all booked appointments for this location on this date
  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      locationId,
      scheduledTime: { gte: dayStart, lte: dayEnd },
      status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
    },
    select: { scheduledTime: true, estimatedDuration: true },
  });

  const bookedTimes = new Set(
    bookedAppointments.map((a) => {
      const d = new Date(a.scheduledTime);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    })
  );

  // Generate 30-minute slots from morning to evening
  const morningStart = location.morningStart || "10:00";
  const eveningEnd = location.eveningEnd || "19:30";

  const [startH, startM] = morningStart.split(":").map(Number);
  const [endH, endM] = eveningEnd.split(":").map(Number);

  const slots: string[] = [];
  let h = startH;
  let m = startM;

  while (h < endH || (h === endH && m <= endM)) {
    const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    // Skip siesta hours if configured
    const inSiesta =
      location.siestaStart &&
      location.siestaEnd &&
      timeStr >= location.siestaStart &&
      timeStr < location.siestaEnd;

    if (!bookedTimes.has(timeStr) && !inSiesta) {
      slots.push(timeStr);
    }

    m += 30;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }

  return NextResponse.json({ slots });
}
