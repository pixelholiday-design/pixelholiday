import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";

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
  shifts: { take: 30, orderBy: { date: "desc" as const } },
  equipmentAssignments: { include: { equipment: true } },
  commissions: { include: { order: true }, take: 100, orderBy: { id: "desc" as const } },
  galleries: { include: { order: true }, take: 50 },
} as const;

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER", "SUPERVISOR"]);
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: SAFE_USER_SELECT,
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().optional(),
  role: z
    .enum(["CEO", "OPERATIONS_MANAGER", "SUPERVISOR", "PHOTOGRAPHER", "SALES_STAFF", "RECEPTIONIST", "ACADEMY_TRAINEE"])
    .optional(),
  locationId: z.string().nullable().optional(),
  pin: z.string().regex(/^\d{4,8}$/).optional(),
  password: z.string().min(8).max(128).optional(),
  salary: z.number().nonnegative().optional(),
  rating: z.number().min(0).max(5).optional(),
  isRepeater: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const body = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const data: any = { ...parsed.data };
    if (parsed.data.password) data.password = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.update({ where: { id: params.id }, data, select: SAFE_USER_SELECT });
    return NextResponse.json({ user });
  } catch (e: any) {
    const g = handleGuardError(e);
    if (g) return g;
    if (e?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["CEO"]);
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const g = handleGuardError(e);
    if (g) return g;
    if (e?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (e?.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete — user has linked records (galleries, commissions, etc.)" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
