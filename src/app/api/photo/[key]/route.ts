import { NextRequest, NextResponse } from "next/server";
import { r2, isR2Configured } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

/** Proxy R2 photos through Next.js so they're accessible without a public R2 URL */
export async function GET(req: NextRequest, { params }: { params: { key: string } }) {
  const key = decodeURIComponent(params.key);
  if (!key) return new NextResponse("Not found", { status: 404 });

  // When R2 isn't configured, redirect to a placeholder image so galleries
  // still render visually instead of showing broken image icons.
  if (!isR2Configured) {
    const seed = key.replace(/[^a-z0-9]/gi, "").slice(0, 12);
    return NextResponse.redirect(`https://picsum.photos/seed/${seed}/1200/800`, 302);
  }

  try {
    const cmd = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });
    const obj = await r2.send(cmd);
    if (!obj.Body) return new NextResponse("Not found", { status: 404 });

    const bytes = await obj.Body.transformToByteArray();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": obj.ContentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
