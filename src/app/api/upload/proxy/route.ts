import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, isR2Configured, publicR2Url } from "@/lib/r2";

/**
 * Proxy upload route — fallback when direct R2 PUT is blocked by CORS.
 * Client POSTs FormData with `file`, `key`, and `contentType`.
 * Server uploads to R2 server-side (no CORS restriction).
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const key = formData.get("key") as string | null;
    const contentType = (formData.get("contentType") as string | null) || "application/octet-stream";

    if (!file || !key) {
      return NextResponse.json({ error: "Missing file or key" }, { status: 400 });
    }

    if (!isR2Configured) {
      // Dev fallback — pretend it worked
      return NextResponse.json({ ok: true, key, publicUrl: publicR2Url(key), mocked: true });
    }

    const arrayBuffer = await file.arrayBuffer();
    const body = Buffer.from(arrayBuffer);

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );

    return NextResponse.json({ ok: true, key, publicUrl: publicR2Url(key) });
  } catch (e: any) {
    console.error("proxy upload error", e);
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
}
