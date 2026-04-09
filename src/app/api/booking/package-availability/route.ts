import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("locationId");
    const dateStr = searchParams.get("date");
    const packageId = searchParams.get("packageId");

    if (!dateStr) {
      return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });
    }

    // Get package duration (default 60 min)
    let duration = 60;
    if (packageId) {
      const pkg = await prisma.photoPackage.findUnique({
        where: { id: packageId },
        select: { duration: true },
      });
      if (pkg) duration = pkg.duration;
    }

    // Find photographers at this location
    const photographerWhere: Record<string, unknown> = { role: "PHOTOGRAPHER" };
    if (locationId) photographerWhere.locationId = locationId;

    const photographers = await prisma.user.findMany({
      where: photographerWhere,
      select: { id: true, name: true },
    });

    if (photographers.length === 0) {
      return NextResponse.json({ date: dateStr, slots: [] });
    }

    const photographerIds = photographers.map((p) => p.id);

    // Parse the requested date
    const requestedDate = new Date(dateStr + "T00:00:00");

    // Get availability for these photographers on this date
    const availabilities = await prisma.photographerAvailability.findMany({
      where: {
        userId: { in: photographerIds },
        date: requestedDate,
        isAvailable: true,
      },
    });

    // Get existing appointments on this date
    const dayStart = new Date(dateStr + "T00:00:00");
    const dayEnd = new Date(dateStr + "T23:59:59");
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        assignedPhotographerId: { in: photographerIds },
        scheduledTime: { gte: dayStart, lte: dayEnd },
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
      },
      select: {
        assignedPhotographerId: true,
        scheduledTime: true,
        estimatedDuration: true,
      },
    });

    // Build a map of booked time ranges per photographer
    const bookedRanges: Record<string, Array<{ start: number; end: number }>> = {};
    for (const appt of existingAppointments) {
      const pid = appt.assignedPhotographerId;
      if (!bookedRanges[pid]) bookedRanges[pid] = [];
      const startMin = appt.scheduledTime.getHours() * 60 + appt.scheduledTime.getMinutes();
      bookedRanges[pid].push({ start: startMin, end: startMin + (appt.estimatedDuration || 60) });
    }

    // Generate time slots based on package duration
    // Default operating hours if no availability records: 09:00 - 19:00
    const defaultStart = 9 * 60; // 09:00 in minutes
    const defaultEnd = 19 * 60; // 19:00 in minutes

    // Determine operating window from availability records or defaults
    let opStart = defaultStart;
    let opEnd = defaultEnd;
    if (availabilities.length > 0) {
      const starts = availabilities.map((a) => {
        const [h, m] = a.startTime.split(":").map(Number);
        return h * 60 + (m || 0);
      });
      const ends = availabilities.map((a) => {
        const [h, m] = a.endTime.split(":").map(Number);
        return h * 60 + (m || 0);
      });
      opStart = Math.min(...starts);
      opEnd = Math.max(...ends);
    }

    // Calculate approximate golden hour (1h before ~19:00 sunset — simplified)
    const goldenHourStart = 17 * 60 + 30; // 17:30

    // Generate slots
    const slots: Array<{
      time: string;
      isGoldenHour: boolean;
      availablePhotographers: number;
      label?: string;
    }> = [];

    for (let mins = opStart; mins + duration <= opEnd; mins += 30) {
      const slotEnd = mins + duration;

      // Count how many photographers are free for this slot
      let availCount = 0;
      for (const pid of photographerIds) {
        // Check if photographer has availability set and if so is available
        const hasAvail = availabilities.find((a) => a.userId === pid);
        if (availabilities.length > 0 && !hasAvail) continue; // If others have availability set but this one doesn't, skip

        // Check if slot overlaps with any booked range
        const ranges = bookedRanges[pid] || [];
        const overlaps = ranges.some((r) => mins < r.end && slotEnd > r.start);
        if (!overlaps) availCount++;
      }

      if (availCount === 0) continue;

      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const isGoldenHour = mins >= goldenHourStart && mins < goldenHourStart + 90;

      let label: string | undefined;
      if (mins < 12 * 60) label = "Morning";
      else if (mins < 15 * 60) label = "Midday";
      else if (isGoldenHour) label = "Golden Hour";
      else label = "Afternoon";

      slots.push({ time: timeStr, isGoldenHour, availablePhotographers: availCount, label });
    }

    return NextResponse.json({ date: dateStr, slots });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 });
  }
}
