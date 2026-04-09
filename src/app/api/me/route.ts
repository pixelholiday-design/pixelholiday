import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Returns current user info + locations list. No admin role required. */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, role: true, locationId: true, location: { select: { id: true, name: true, type: true } } },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Get all locations for the dropdown
    const locations = await prisma.location.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    });

    // Get photographers at user's location (for supervisor/manager selecting photographers)
    const photographers = await prisma.user.findMany({
      where: { role: "PHOTOGRAPHER" },
      select: { id: true, name: true, locationId: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      ok: true,
      user,
      locations,
      photographers,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}
