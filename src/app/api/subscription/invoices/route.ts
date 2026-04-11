import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { stripeCustomerId: true },
  });

  if (!org?.stripeCustomerId) {
    return NextResponse.json({ ok: true, invoices: [] });
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: org.stripeCustomerId,
      limit: 24,
    });

    const formatted = invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
      amount: (inv.amount_paid || 0) / 100,
      currency: inv.currency?.toUpperCase() || "EUR",
      status: inv.status,
      pdfUrl: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    }));

    return NextResponse.json({ ok: true, invoices: formatted });
  } catch (e: any) {
    console.error("Stripe invoices fetch error:", e.message);
    return NextResponse.json({ ok: true, invoices: [] });
  }
}
