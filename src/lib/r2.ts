import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";

export const isR2Configured = Boolean(accountId && accessKeyId && secretAccessKey);

export const r2 = new S3Client({
  region: "auto",
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "https://example.invalid",
  credentials: { accessKeyId: accessKeyId || "x", secretAccessKey: secretAccessKey || "x" },
});

export async function getPresignedUploadUrl(key: string, contentType: string) {
  if (!isR2Configured) {
    // dev mock — return a fake URL the client can no-op against
    return { url: `https://mock.r2.local/${encodeURIComponent(key)}?upload=mock`, mocked: true };
  }
  const cmd = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(r2, cmd, { expiresIn: 3600 });
  return { url, mocked: false };
}

export function publicR2Url(key: string) {
  const base = process.env.R2_PUBLIC_URL || "";
  if (base && base !== "https://example.r2.dev") {
    return `${base.replace(/\/$/, "")}/${key}`;
  }
  // No public R2 URL configured — use the server-side photo proxy
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return `${appUrl}/api/photo/${encodeURIComponent(key)}`;
}
