import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// ---- inline email send (mirrors src/lib/email.ts logic) ----
import { Resend } from "resend";
const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.FROM_EMAIL || "noreply@fotiqo.com";
const resend = KEY ? new Resend(KEY) : null;
async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[Email MOCK -> ${to}] ${subject}`);
    return { mocked: true };
  }
  return resend.emails.send({ from: FROM, to, subject, html });
}

const TEMPLATES: Record<string, { subject: string; bodyFn: (link?: string) => string }> = {
  gallery_ready: {
    subject: "Your photos are ready!",
    bodyFn: (link) =>
      `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h1 style="color:#1a2744;font-size:24px">Your photos are ready!</h1>
        <p>Your Fotiqo gallery is waiting for you. View and download your holiday memories now.</p>
        ${link ? `<p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#e07a5f;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">View Gallery</a></p>` : ""}
        <p style="color:#888;font-size:12px">Fotiqo Photography</p>
      </div>`,
  },
  limited_offer_25: {
    subject: "25% off your holiday photos - limited time!",
    bodyFn: () =>
      `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h1 style="color:#1a2744;font-size:24px">Don't miss out!</h1>
        <p>For a limited time, get <strong>25% off</strong> your holiday photo gallery. Relive the magic before it's gone.</p>
        <p style="background:#f2cc8f;display:inline-block;padding:8px 16px;border-radius:6px;font-weight:700;color:#1a2744">Code: HOLIDAY25</p>
        <p style="color:#888;font-size:12px">Fotiqo Photography</p>
      </div>`,
  },
  anniversary_reminder: {
    subject: "Happy anniversary! Revisit your memories",
    bodyFn: () =>
      `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h1 style="color:#1a2744;font-size:24px">Happy Anniversary!</h1>
        <p>It's been a year since your amazing holiday. Relive the moments — your gallery is still available with a special 20% discount.</p>
        <p style="background:#f2cc8f;display:inline-block;padding:8px 16px;border-radius:6px;font-weight:700;color:#1a2744">Code: MEMORIES20</p>
        <p style="color:#888;font-size:12px">Fotiqo Photography</p>
      </div>`,
  },
};

const schema = z.object({
  template: z.string().min(1),
  locationId: z.string().optional(),
  subject: z.string().optional(),
  customBody: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  const { template, locationId, subject: customSubject, customBody } = parsed.data;

  // Resolve template or custom body
  const tpl = TEMPLATES[template];
  const emailSubject = customSubject || tpl?.subject || "News from Fotiqo";
  const emailBody = customBody || tpl?.bodyFn() || "<p>Hello from Fotiqo!</p>";

  // Fetch customers with emails
  const where: any = { email: { not: null } };
  if (locationId) where.locationId = locationId;

  const customers = await prisma.customer.findMany({
    where,
    select: { email: true, name: true },
  });

  const emails = customers.filter((c) => c.email).map((c) => c.email as string);
  let sentCount = 0;

  for (const email of emails) {
    try {
      await sendEmail(email, emailSubject, emailBody);
      sentCount++;
    } catch (err) {
      console.error(`[Campaign] Failed to send to ${email}:`, err);
    }
  }

  // Record campaign
  await prisma.marketingCampaign.create({
    data: {
      name: `Campaign: ${template}`,
      template,
      subject: emailSubject,
      body: emailBody,
      locationId: locationId ?? null,
      sentCount,
      sentAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, sentCount });
}
