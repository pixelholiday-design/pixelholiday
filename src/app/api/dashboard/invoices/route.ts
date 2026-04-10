import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/dashboard/invoices — List invoices for current photographer.
 * POST /api/dashboard/invoices — Create a new invoice.
 *
 * Invoices are stored in-memory for now (no Prisma model yet).
 * TODO: Add Invoice model to Prisma schema when ready for production invoicing.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return empty invoices for now — will connect to Prisma when Invoice model is added
  return NextResponse.json({ invoices: [] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  // Mock creation — TODO: persist to database
  return NextResponse.json({
    ok: true,
    invoice: {
      id: `inv_${Date.now()}`,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      amount: body.amount,
      description: body.description,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
    },
  });
}
