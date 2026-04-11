import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, orgId },
    include: { items: true },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice.status === "PAID") return NextResponse.json({ error: "Already paid" }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Create Stripe Payment Link for the invoice
  let stripePaymentLink: string | null = null;
  try {
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("xxx")) {
      const paymentLink = await stripe.paymentLinks.create({
        line_items: invoice.items.map((item) => ({
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: { name: item.description },
            unit_amount: Math.round(item.unitPrice * 100),
          },
          quantity: item.quantity,
        })),
        metadata: { invoiceId: invoice.id },
        after_completion: {
          type: "redirect",
          redirect: { url: `${appUrl}/invoice/${invoice.id}?paid=true` },
        },
      });
      stripePaymentLink = paymentLink.url;
    }
  } catch (e: any) {
    console.warn("Stripe payment link creation failed:", e.message);
  }

  // Send email via Resend
  try {
    const { emailGalleryLink } = await import("@/lib/email");
    const payLink = stripePaymentLink || `${appUrl}/invoice/${invoice.id}`;
    await emailGalleryLink(
      invoice.clientEmail,
      payLink,
    );
  } catch (e: any) {
    console.warn("Email send failed:", e.message);
  }

  // Update invoice status
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      stripePaymentLink,
    },
  });

  return NextResponse.json({ ok: true, stripePaymentLink });
}
