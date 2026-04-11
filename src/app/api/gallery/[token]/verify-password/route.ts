import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const body = await req.json().catch(() => ({}));
  const { password } = body;

  if (!password || typeof password !== "string") {
    return NextResponse.json({ ok: false, error: "Password required" }, { status: 400 });
  }

  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    select: { id: true, accessPassword: true },
  });

  if (!gallery) {
    return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404 });
  }

  if (!gallery.accessPassword) {
    return NextResponse.json({ ok: true });
  }

  // Simple string comparison (passwords are stored as plain text by photographers)
  if (password !== gallery.accessPassword) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  // Set httpOnly cookie valid for 24 hours
  const cookieStore = cookies();
  cookieStore.set(`gallery_access_${params.token}`, "granted", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
