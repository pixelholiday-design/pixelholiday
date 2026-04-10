import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/gallery/[token]/manifest.json — Dynamic PWA manifest per gallery.
 * Allows clients to "Add to Home Screen" with photographer branding.
 */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    select: {
      id: true,
      photographer: { select: { name: true } },
      customer: { select: { name: true } },
      location: { select: { name: true } },
    },
  });

  const photographerName = gallery?.photographer?.name || "Fotiqo";
  const clientName = gallery?.customer?.name || "Your";
  const locationName = gallery?.location?.name || "";

  const manifest = {
    name: `${photographerName} Gallery`,
    short_name: `${clientName}'s Photos`,
    description: `Photo gallery${locationName ? ` at ${locationName}` : ""} by ${photographerName}`,
    start_url: `/gallery/${params.token}`,
    display: "standalone",
    background_color: "#FAFAF9",
    theme_color: "#0EA5A5",
    orientation: "portrait-primary",
    icons: [
      { src: "/fotiqo-icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/fotiqo-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/fotiqo-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
