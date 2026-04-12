import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";

function generateEmailVariants(name: string, format: string, subdomain: string | null): string[] {
  const parts = name.trim().toLowerCase().split(/\s+/);
  const first = parts[0] || "user";
  const last = parts[parts.length - 1] || "";
  const domain = subdomain ? `${subdomain}.fotiqo.com` : "fotiqo.com";

  let base: string;
  switch (format) {
    case "firstnamelastname":
      base = `${first}${last}`;
      break;
    case "firstname":
      base = first;
      break;
    case "initials.specialty":
      base = parts.map((p) => p[0]).join(".");
      break;
    case "firstname.lastname":
    default:
      base = last ? `${first}.${last}` : first;
      break;
  }

  // Sanitize: only allow a-z, 0-9, dots
  base = base.replace(/[^a-z0-9.]/g, "");

  const variants: string[] = [`${base}@${domain}`];
  for (let i = 2; i <= 10; i++) {
    variants.push(`${base}${i}@${domain}`);
  }
  return variants;
}

function generateMinimalSignatureHtml(displayName: string, email: string, brandColor: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333333;line-height:1.4;">
  <tr><td style="padding-bottom:4px;font-weight:bold;font-size:14px;color:${brandColor};">${displayName}</td></tr>
  <tr><td style="color:#666666;">${email}</td></tr>
  <tr><td style="padding-top:8px;font-size:11px;color:#999999;">Powered by <a href="https://fotiqo.com" style="color:${brandColor};text-decoration:none;">Fotiqo</a></td></tr>
</table>`;
}

function generateBrandedSignatureHtml(displayName: string, email: string, company: string, brandColor: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333333;line-height:1.4;">
  <tr><td style="padding-bottom:4px;font-weight:bold;font-size:14px;color:${brandColor};">${displayName}</td></tr>
  <tr><td style="color:#555555;">${company}</td></tr>
  <tr><td style="color:#666666;">${email}</td></tr>
  <tr><td style="padding-top:8px;font-size:11px;color:#999999;">Powered by <a href="https://fotiqo.com" style="color:${brandColor};text-decoration:none;">Fotiqo</a></td></tr>
</table>`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  try {
    const { preferredFormat } = await req.json();

    // Check if user already has an email
    const existing = await prisma.fotiqoEmail.findFirst({
      where: { userId: user.id },
    });
    if (existing) {
      return NextResponse.json({ error: "You already have a Fotiqo email", email: existing }, { status: 409 });
    }

    // Get user details
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { org: true },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine subdomain: venue staff get @{slug}.fotiqo.com
    const isVenueStaff = dbUser.org?.slug ? true : false;
    const subdomain = isVenueStaff ? dbUser.org!.slug! : null;

    // Generate email candidates
    const candidates = generateEmailVariants(
      dbUser.name,
      preferredFormat || "firstname.lastname",
      subdomain
    );

    // Check which are taken
    const takenEmails = await prisma.fotiqoEmail.findMany({
      where: { emailAddress: { in: candidates } },
      select: { emailAddress: true },
    });
    const takenSet = new Set(takenEmails.map((e) => e.emailAddress));

    const chosenEmail = candidates.find((c) => !takenSet.has(c));
    if (!chosenEmail) {
      return NextResponse.json({ error: "Could not generate a unique email address. Try a different format." }, { status: 409 });
    }

    // Determine email type and signature style
    const emailType = isVenueStaff ? "COMPANY" : "PERSONAL";
    const sigStyle = isVenueStaff ? "COMPANY_BRANDED" : "MINIMAL";
    const brandColor = dbUser.org?.brandColor || dbUser.org?.brandPrimaryColor || "#0EA5A5";
    const companyName = dbUser.org?.brandName || dbUser.org?.name || "Fotiqo";

    // Create email + signature in a transaction
    const [fotiqoEmail, signature] = await prisma.$transaction(async (tx) => {
      const email = await tx.fotiqoEmail.create({
        data: {
          userId: user.id,
          organizationId: dbUser.orgId,
          emailAddress: chosenEmail,
          emailType,
          subdomain,
          isActive: true,
          isPrimary: true,
        },
      });

      const signatureHtml = isVenueStaff
        ? generateBrandedSignatureHtml(dbUser.name, chosenEmail, companyName, brandColor)
        : generateMinimalSignatureHtml(dbUser.name, chosenEmail, brandColor);

      const sig = await tx.emailSignature.create({
        data: {
          userId: user.id,
          organizationId: dbUser.orgId,
          style: sigStyle,
          displayName: dbUser.name,
          email: chosenEmail,
          company: isVenueStaff ? companyName : undefined,
          brandColor,
          showPoweredBy: true,
          signatureHtml,
        },
      });

      return [email, sig];
    });

    return NextResponse.json({ email: fotiqoEmail, signature });
  } catch (error: any) {
    console.error("Email setup error:", error);
    return NextResponse.json({ error: error.message || "Failed to set up email" }, { status: 500 });
  }
}
