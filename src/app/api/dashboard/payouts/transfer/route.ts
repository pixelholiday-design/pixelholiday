import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createTransfer } from "@/lib/stripe-connect";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { stripeConnectAccountId: true, stripeConnectStatus: true },
  });

  if (!org?.stripeConnectAccountId || org.stripeConnectStatus !== "ACTIVE") {
    return NextResponse.json({ error: "Payout account not active" }, { status: 400 });
  }

  const body = await req.json();
  const { amount, currency, description } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    const transfer = await createTransfer({
      amount,
      currency: currency || "EUR",
      destinationAccountId: org.stripeConnectAccountId,
      description: description || "Payout",
    });

    return NextResponse.json({ ok: true, transferId: transfer.id });
  } catch (e: any) {
    console.error("Stripe transfer error:", e.message);
    return NextResponse.json({ error: "Transfer failed: " + e.message }, { status: 500 });
  }
}
