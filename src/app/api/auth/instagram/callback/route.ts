import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { exchangeCodeForToken } from "@/lib/instagram";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?instagram=error", req.url),
    );
  }

  try {
    const { accessToken, userId } = await exchangeCodeForToken(code);
    const userIdStr = (session.user as any).id;

    // Store token on photographer profile
    await prisma.photographerProfile.updateMany({
      where: { userId: userIdStr },
      data: {
        instagramAccessToken: accessToken,
        instagramUserId: userId,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/settings?instagram=connected", req.url),
    );
  } catch (e: any) {
    console.error("Instagram OAuth error:", e.message);
    return NextResponse.redirect(
      new URL("/dashboard/settings?instagram=error", req.url),
    );
  }
}
