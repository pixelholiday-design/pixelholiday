import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const PRICES: Record<string, number> = { BASIC: 5000, UNLIMITED: 15000, VIP: 30000 };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tier, customerEmail, customerWhatsapp, locationId } = body;
  const amount = PRICES[tier] || PRICES.BASIC;

  let customer = await prisma.customer.findFirst({ where: { email: customerEmail } });
  if (!customer) customer = await prisma.customer.create({ data: { email: customerEmail, whatsapp: customerWhatsapp, locationId } });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price_data: { currency: "eur", product_data: { name: `Digital Pass ${tier}` }, unit_amount: amount }, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pass/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pass/${locationId}`,
    metadata: { customerId: customer.id, passType: tier, type: "DIGITAL_PASS" },
  });

  return NextResponse.json({ sessionUrl: session.url });
}
