import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSocialLinks(
  instagram?: string,
  facebook?: string,
  linkedin?: string,
  tiktok?: string,
  brandColor?: string
): string {
  const links: string[] = [];
  const color = brandColor || "#0EA5A5";
  const style = `color:${color};text-decoration:none;font-size:12px;`;

  if (instagram) links.push(`<a href="https://instagram.com/${escapeHtml(instagram)}" style="${style}">Instagram</a>`);
  if (facebook) links.push(`<a href="https://facebook.com/${escapeHtml(facebook)}" style="${style}">Facebook</a>`);
  if (linkedin) links.push(`<a href="https://linkedin.com/in/${escapeHtml(linkedin)}" style="${style}">LinkedIn</a>`);
  if (tiktok) links.push(`<a href="https://tiktok.com/@${escapeHtml(tiktok)}" style="${style}">TikTok</a>`);

  if (links.length === 0) return "";
  return `<tr><td style="padding-top:6px;">${links.join(" &nbsp;|&nbsp; ")}</td></tr>`;
}

function buildPoweredBy(show: boolean, brandColor: string): string {
  if (!show) return "";
  return `<tr><td style="padding-top:10px;font-size:10px;color:#aaaaaa;">Powered by <a href="https://fotiqo.com" style="color:${brandColor};text-decoration:none;">Fotiqo</a></td></tr>`;
}

function generateMinimalHtml(data: SignatureData): string {
  const c = data.brandColor || "#0EA5A5";
  const social = buildSocialLinks(data.socialInstagram, data.socialFacebook, data.socialLinkedin, data.socialTiktok, c);
  const powered = buildPoweredBy(data.showPoweredBy !== false, c);

  let contactLine = "";
  if (data.phone || data.email) {
    const parts = [];
    if (data.phone) parts.push(escapeHtml(data.phone));
    if (data.email) parts.push(`<a href="mailto:${escapeHtml(data.email)}" style="color:${c};text-decoration:none;">${escapeHtml(data.email)}</a>`);
    contactLine = `<tr><td style="color:#666666;font-size:12px;">${parts.join(" &nbsp;|&nbsp; ")}</td></tr>`;
  }

  let websiteLine = "";
  if (data.websiteUrl) {
    websiteLine = `<tr><td><a href="${escapeHtml(data.websiteUrl)}" style="color:${c};text-decoration:none;font-size:12px;">${escapeHtml(data.websiteUrl)}</a></td></tr>`;
  }

  let bookingLine = "";
  if (data.bookingUrl) {
    bookingLine = `<tr><td style="padding-top:6px;"><a href="${escapeHtml(data.bookingUrl)}" style="display:inline-block;padding:6px 16px;background-color:${c};color:#ffffff;text-decoration:none;border-radius:4px;font-size:12px;font-weight:bold;">Book a Session</a></td></tr>`;
  }

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333333;line-height:1.5;">
  <tr><td style="font-weight:bold;font-size:15px;color:${c};">${escapeHtml(data.displayName)}</td></tr>
  ${data.title ? `<tr><td style="color:#555555;font-size:12px;">${escapeHtml(data.title)}</td></tr>` : ""}
  ${data.company ? `<tr><td style="color:#555555;font-size:12px;">${escapeHtml(data.company)}</td></tr>` : ""}
  ${contactLine}
  ${websiteLine}
  ${data.location ? `<tr><td style="color:#888888;font-size:11px;">${escapeHtml(data.location)}</td></tr>` : ""}
  ${bookingLine}
  ${social}
  ${powered}
</table>`;
}

function generateWithLogoHtml(data: SignatureData): string {
  const c = data.brandColor || "#0EA5A5";
  const social = buildSocialLinks(data.socialInstagram, data.socialFacebook, data.socialLinkedin, data.socialTiktok, c);
  const powered = buildPoweredBy(data.showPoweredBy !== false, c);

  let contactLine = "";
  if (data.phone || data.email) {
    const parts = [];
    if (data.phone) parts.push(escapeHtml(data.phone));
    if (data.email) parts.push(`<a href="mailto:${escapeHtml(data.email)}" style="color:${c};text-decoration:none;">${escapeHtml(data.email)}</a>`);
    contactLine = `<tr><td style="color:#666666;font-size:12px;">${parts.join(" &nbsp;|&nbsp; ")}</td></tr>`;
  }

  let bookingLine = "";
  if (data.bookingUrl) {
    bookingLine = `<tr><td style="padding-top:6px;"><a href="${escapeHtml(data.bookingUrl)}" style="display:inline-block;padding:6px 16px;background-color:${c};color:#ffffff;text-decoration:none;border-radius:4px;font-size:12px;font-weight:bold;">Book a Session</a></td></tr>`;
  }

  const logoCell = data.logoUrl
    ? `<td style="vertical-align:top;padding-right:14px;"><img src="${escapeHtml(data.logoUrl)}" alt="Logo" width="60" height="60" style="display:block;border-radius:4px;" /></td>`
    : "";

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333333;line-height:1.5;">
  <tr>
    ${logoCell}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-weight:bold;font-size:15px;color:${c};">${escapeHtml(data.displayName)}</td></tr>
        ${data.title ? `<tr><td style="color:#555555;font-size:12px;">${escapeHtml(data.title)}</td></tr>` : ""}
        ${data.company ? `<tr><td style="color:#555555;font-size:12px;">${escapeHtml(data.company)}</td></tr>` : ""}
        ${contactLine}
        ${data.websiteUrl ? `<tr><td><a href="${escapeHtml(data.websiteUrl)}" style="color:${c};text-decoration:none;font-size:12px;">${escapeHtml(data.websiteUrl)}</a></td></tr>` : ""}
        ${data.location ? `<tr><td style="color:#888888;font-size:11px;">${escapeHtml(data.location)}</td></tr>` : ""}
        ${bookingLine}
        ${social}
        ${powered}
      </table>
    </td>
  </tr>
</table>`;
}

function generateWithPhotoHtml(data: SignatureData): string {
  const c = data.brandColor || "#0EA5A5";
  const social = buildSocialLinks(data.socialInstagram, data.socialFacebook, data.socialLinkedin, data.socialTiktok, c);
  const powered = buildPoweredBy(data.showPoweredBy !== false, c);

  let contactLine = "";
  if (data.phone || data.email) {
    const parts = [];
    if (data.phone) parts.push(escapeHtml(data.phone));
    if (data.email) parts.push(`<a href="mailto:${escapeHtml(data.email)}" style="color:${c};text-decoration:none;">${escapeHtml(data.email)}</a>`);
    contactLine = `<tr><td style="color:#666666;font-size:12px;">${parts.join(" &nbsp;|&nbsp; ")}</td></tr>`;
  }

  let bookingLine = "";
  if (data.bookingUrl) {
    bookingLine = `<tr><td style="padding-top:6px;"><a href="${escapeHtml(data.bookingUrl)}" style="display:inline-block;padding:6px 16px;background-color:${c};color:#ffffff;text-decoration:none;border-radius:4px;font-size:12px;font-weight:bold;">Book a Session</a></td></tr>`;
  }

  const photoCell = data.photoUrl
    ? `<td style="vertical-align:top;padding-right:14px;"><img src="${escapeHtml(data.photoUrl)}" alt="${escapeHtml(data.displayName)}" width="70" height="70" style="display:block;border-radius:50%;" /></td>`
    : "";

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333333;line-height:1.5;">
  <tr>
    ${photoCell}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-weight:bold;font-size:15px;color:${c};">${escapeHtml(data.displayName)}</td></tr>
        ${data.title ? `<tr><td style="color:#555555;font-size:12px;">${escapeHtml(data.title)}</td></tr>` : ""}
        ${data.company ? `<tr><td style="color:#555555;font-size:12px;">${escapeHtml(data.company)}</td></tr>` : ""}
        ${contactLine}
        ${data.websiteUrl ? `<tr><td><a href="${escapeHtml(data.websiteUrl)}" style="color:${c};text-decoration:none;font-size:12px;">${escapeHtml(data.websiteUrl)}</a></td></tr>` : ""}
        ${data.location ? `<tr><td style="color:#888888;font-size:11px;">${escapeHtml(data.location)}</td></tr>` : ""}
        ${bookingLine}
        ${social}
        ${powered}
      </table>
    </td>
  </tr>
</table>`;
}

function generateCompanyBrandedHtml(data: SignatureData): string {
  const c = data.brandColor || "#0EA5A5";
  const social = buildSocialLinks(data.socialInstagram, data.socialFacebook, data.socialLinkedin, data.socialTiktok, c);
  const powered = buildPoweredBy(data.showPoweredBy !== false, c);

  let contactLine = "";
  if (data.phone || data.email) {
    const parts = [];
    if (data.phone) parts.push(escapeHtml(data.phone));
    if (data.email) parts.push(`<a href="mailto:${escapeHtml(data.email)}" style="color:${c};text-decoration:none;">${escapeHtml(data.email)}</a>`);
    contactLine = `<tr><td style="color:#666666;font-size:12px;">${parts.join(" &nbsp;|&nbsp; ")}</td></tr>`;
  }

  let bookingLine = "";
  if (data.bookingUrl) {
    bookingLine = `<tr><td style="padding-top:8px;"><a href="${escapeHtml(data.bookingUrl)}" style="display:inline-block;padding:8px 20px;background-color:${c};color:#ffffff;text-decoration:none;border-radius:4px;font-size:13px;font-weight:bold;">Book a Session</a></td></tr>`;
  }

  const logoRow = data.logoUrl
    ? `<tr><td style="padding-bottom:10px;"><img src="${escapeHtml(data.logoUrl)}" alt="${escapeHtml(data.company || "Company")}" width="140" style="display:block;" /></td></tr>`
    : "";

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333333;line-height:1.5;">
  ${logoRow}
  <tr><td style="border-top:2px solid ${c};padding-top:10px;font-weight:bold;font-size:15px;color:${c};">${escapeHtml(data.displayName)}</td></tr>
  ${data.title ? `<tr><td style="color:#555555;font-size:12px;">${escapeHtml(data.title)}</td></tr>` : ""}
  ${data.company ? `<tr><td style="color:#555555;font-size:13px;font-weight:bold;">${escapeHtml(data.company)}</td></tr>` : ""}
  ${contactLine}
  ${data.websiteUrl ? `<tr><td><a href="${escapeHtml(data.websiteUrl)}" style="color:${c};text-decoration:none;font-size:12px;">${escapeHtml(data.websiteUrl)}</a></td></tr>` : ""}
  ${data.location ? `<tr><td style="color:#888888;font-size:11px;">${escapeHtml(data.location)}</td></tr>` : ""}
  ${bookingLine}
  ${social}
  ${powered}
</table>`;
}

interface SignatureData {
  style: string;
  displayName: string;
  title?: string;
  company?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  bookingUrl?: string;
  location?: string;
  logoUrl?: string;
  photoUrl?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialLinkedin?: string;
  socialTiktok?: string;
  brandColor?: string;
  showPoweredBy?: boolean;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  try {
    const data: SignatureData = await req.json();

    if (!data.displayName) {
      return NextResponse.json({ error: "displayName is required" }, { status: 400 });
    }

    const style = data.style || "MINIMAL";

    // Generate HTML based on style
    let signatureHtml: string;
    switch (style) {
      case "WITH_LOGO":
        signatureHtml = generateWithLogoHtml(data);
        break;
      case "WITH_PHOTO":
        signatureHtml = generateWithPhotoHtml(data);
        break;
      case "COMPANY_BRANDED":
        signatureHtml = generateCompanyBrandedHtml(data);
        break;
      case "MINIMAL":
      default:
        signatureHtml = generateMinimalHtml(data);
        break;
    }

    // Upsert EmailSignature record
    const signature = await prisma.emailSignature.upsert({
      where: { userId: user.id },
      update: {
        style,
        displayName: data.displayName,
        title: data.title || null,
        company: data.company || null,
        phone: data.phone || null,
        email: data.email || null,
        websiteUrl: data.websiteUrl || null,
        bookingUrl: data.bookingUrl || null,
        location: data.location || null,
        logoUrl: data.logoUrl || null,
        photoUrl: data.photoUrl || null,
        socialInstagram: data.socialInstagram || null,
        socialFacebook: data.socialFacebook || null,
        socialLinkedin: data.socialLinkedin || null,
        socialTiktok: data.socialTiktok || null,
        brandColor: data.brandColor || "#0EA5A5",
        showPoweredBy: data.showPoweredBy !== false,
        signatureHtml,
      },
      create: {
        userId: user.id,
        style,
        displayName: data.displayName,
        title: data.title || null,
        company: data.company || null,
        phone: data.phone || null,
        email: data.email || null,
        websiteUrl: data.websiteUrl || null,
        bookingUrl: data.bookingUrl || null,
        location: data.location || null,
        logoUrl: data.logoUrl || null,
        photoUrl: data.photoUrl || null,
        socialInstagram: data.socialInstagram || null,
        socialFacebook: data.socialFacebook || null,
        socialLinkedin: data.socialLinkedin || null,
        socialTiktok: data.socialTiktok || null,
        brandColor: data.brandColor || "#0EA5A5",
        showPoweredBy: data.showPoweredBy !== false,
        signatureHtml,
      },
    });

    return NextResponse.json({ signature, signatureHtml });
  } catch (error: any) {
    console.error("Signature generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate signature" }, { status: 500 });
  }
}
