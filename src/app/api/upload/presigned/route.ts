import { NextResponse } from "next/server";
import { z } from "zod";
import { getPresignedUploadUrl, publicR2Url } from "@/lib/r2";

const schema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const safeName = parsed.data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const { url, mocked } = await getPresignedUploadUrl(key, parsed.data.contentType);

  return NextResponse.json({ uploadUrl: url, key, publicUrl: publicR2Url(key), mocked });
}
