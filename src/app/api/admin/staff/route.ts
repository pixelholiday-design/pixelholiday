import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";
import { StaffRole } from "@prisma/client";

export const dynamic = "force-dynamic";

// Fields that must NEVER leave the server.
const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  orgId: true,
  locationId: true,
  isRepeater: true,
  repeaterYears: true,
  salary: true,
  rating: true,
  createdAt: true,
  location: true,
  housing: true,
  equipmentAssignments: { include: { equipment: true } },
  // password and pin are deliberately omitted.
} as const;

export async function GET(req: NextRequest) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER", "SUPERVISOR"]);
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const locationId = searchParams.get("locationId");
    const q = searchParams.get("q");

    const staff = await prisma.user.findMany({
      where: {
        ...(role ? { role: role as StaffRole } : {}),
        ...(locationId ? { locationId } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      select: SAFE_USER_SELECT,
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ staff });
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum([
    "CEO",
    "OPERATIONS_MANAGER",
    "SUPERVISOR",
    "PHOTOGRAPHER",
    "SALES_STAFF",
    "RECEPTIONIST",
    "ACADEMY_TRAINEE",
  ]),
  locationId: z.string().optional(),
  phone: z.string().optional(),
  pin: z.string().regex(/^\d{4,8}$/).optional(),
  salary: z.number().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const me = await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const body = await req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const password = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password,
        role: parsed.data.role as StaffRole,
        orgId: me.orgId,
        locationId: parsed.data.locationId,
        phone: parsed.data.phone,
        pin: parsed.data.pin,
        salary: parsed.data.salary,
      },
      select: SAFE_USER_SELECT,
    });
    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    const g = handleGuardError(e);
    if (g) return g;
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
