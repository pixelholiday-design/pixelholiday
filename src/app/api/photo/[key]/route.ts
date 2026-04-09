import { NextRequest, NextResponse } from "next/server";
import { r2, isR2Configured } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

/** Proxy R2 photos through Next.js so they're accessible without a public R2 URL */
export async function GET(req: NextRequest, { params }: { params: { key: string } }) {
  const key = decodeURIComponent(params.key);
  if (!key || !isR2Configured) {
    return new NextResponse("Not found", { status: 404 });
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
