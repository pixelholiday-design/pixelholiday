import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getInstagramAuthUrl, fetchUserMedia } from "@/lib/instagram";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const profile = await prisma.photographerProfile.findFirst({
    where: { userId },
    select: { instagramAccessToken: true, instagramUserId: true, socialInstagram: true },
  });

  if (!profile?.instagramAccessToken) {
    const authUrl = getInstagramAuthUrl(userId);
    return NextResponse.json({
      ok: true,
      connected: false,
      authUrl,
      username: profile?.socialInstagram || null,
    });
  }

  try {
    const posts = await fetchUserMedia(profile.instagramAccessToken, 12);
    return NextResponse.json({
      ok: true,
      connected: true,
      posts,
      username: profile.socialInstagram || null,
    });
  } catch (e: any) {
    // Token expired — return auth URL
    const authUrl = getInstagramAuthUrl(userId);
    return NextResponse.json({
      ok: true,
      connected: false,
      authUrl,
      error: "Token expired, please reconnect",
    });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  await prisma.photographerProfile.updateMany({
    where: { userId },
    data: { instagramAccessToken: null, instagramUserId: null },
  });

  return NextResponse.json({ ok: true });
}
