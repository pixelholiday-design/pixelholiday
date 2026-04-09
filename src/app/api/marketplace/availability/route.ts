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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availability = await prisma.photographerAvailability.findMany({
      where: {
        userId,
        date: { gte: today },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Fetch availability error:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, date, startTime, endTime, isAvailable, isRecurring, dayOfWeek, notes } = body;

    if (!userId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields: userId, date, startTime, endTime" },
        { status: 400 }
      );
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "You can only manage your own availability" }, { status: 403 });
    }

    // Look up the user's profile so we can link availability to it
    const profile = await prisma.photographerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    const record = await prisma.photographerAvailability.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(date),
        },
      },
      update: {
        startTime,
        endTime,
        isAvailable: isAvailable ?? true,
        isRecurring: isRecurring ?? false,
        dayOfWeek: dayOfWeek ?? null,
        notes: notes ?? null,
        profileId: profile?.id ?? null,
      },
      create: {
        userId,
        date: new Date(date),
        startTime,
        endTime,
        isAvailable: isAvailable ?? true,
        isRecurring: isRecurring ?? false,
        dayOfWeek: dayOfWeek ?? null,
        notes: notes ?? null,
        profileId: profile?.id ?? null,
      },
    });

    return NextResponse.json({ availability: record });
  } catch (error) {
    console.error("Create availability error:", error);
    return NextResponse.json({ error: "Failed to save availability" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, entries } = body;

    if (!userId || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: userId, entries (non-empty array)" },
        { status: 400 }
      );
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "You can only manage your own availability" }, { status: 403 });
    }

    const profile = await prisma.photographerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    const results = await prisma.$transaction(
      entries.map((entry: { date: string; startTime: string; endTime: string; isAvailable?: boolean }) =>
        prisma.photographerAvailability.upsert({
          where: {
            userId_date: {
              userId,
              date: new Date(entry.date),
            },
          },
          update: {
            startTime: entry.startTime,
            endTime: entry.endTime,
            isAvailable: entry.isAvailable ?? true,
            profileId: profile?.id ?? null,
          },
          create: {
            userId,
            date: new Date(entry.date),
            startTime: entry.startTime,
            endTime: entry.endTime,
            isAvailable: entry.isAvailable ?? true,
            profileId: profile?.id ?? null,
          },
        })
      )
    );

    return NextResponse.json({ availability: results });
  } catch (error) {
    console.error("Bulk update availability error:", error);
    return NextResponse.json({ error: "Failed to bulk update availability" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = req.nextUrl.searchParams.get("userId");
    const date = req.nextUrl.searchParams.get("date");

    if (!userId || !date) {
      return NextResponse.json(
        { error: "Missing required query params: userId, date" },
        { status: 400 }
      );
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "You can only manage your own availability" }, { status: 403 });
    }

    await prisma.photographerAvailability.delete({
      where: {
        userId_date: {
          userId,
          date: new Date(date),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete availability error:", error);
    return NextResponse.json({ error: "Failed to delete availability" }, { status: 500 });
  }
}
