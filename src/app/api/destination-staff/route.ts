import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.string().min(1),
  pin: z.string().length(4).optional(),
  destinationIds: z.array(z.string()).min(1),
});

/** POST /api/destination-staff -- Create a staff member and assign to destinations */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const passwordHash = await bcrypt.hash(data.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, password: passwordHash, role: data.role as any, orgId, pin: data.pin },
  });

  // Assign to destinations
  for (const destId of data.destinationIds) {
    await prisma.destinationStaff.create({
      data: { userId: user.id, destinationId: destId, role: data.role, pin: data.pin },
    });
  }

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
}

/** GET /api/destination-staff -- List staff for current company */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const staff = await prisma.destinationStaff.findMany({
    where: { destination: { organizationId: orgId } },
    include: { destination: { select: { name: true, slug: true } } },
  });

  return NextResponse.json({ staff });
}
