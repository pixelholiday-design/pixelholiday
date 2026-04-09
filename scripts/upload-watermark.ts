/**
 * Upload the Fotiqo watermark to Cloudinary.
 *
 * Usage:
 *   npx tsx scripts/upload-watermark.ts
 *
 * The watermark is an SVG with:
 * - Camera lens icon (circle) + "fotiqo" text
 * - White color with transparency (works on any photo)
 * - 600 x 200 px canvas
 *
 * It's uploaded with public_id "fotiqo_watermark" so it can be referenced
 * in transformation overlays: l_fotiqo_watermark,w_0.5,g_center,o_40
 */

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const WATERMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200">
  <rect width="600" height="200" fill="none"/>
  <!-- Camera lens icon -->
  <circle cx="100" cy="100" r="42" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="5"/>
  <circle cx="100" cy="100" r="28" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="3"/>
  <circle cx="100" cy="100" r="14" fill="rgba(255,255,255,0.6)"/>
  <!-- Aperture blades hint -->
  <line x1="100" y1="58" x2="100" y2="72" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <line x1="100" y1="128" x2="100" y2="142" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <line x1="58" y1="100" x2="72" y2="100" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <line x1="128" y1="100" x2="142" y2="100" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <!-- Brand text -->
  <text x="175" y="118" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="700" fill="rgba(255,255,255,0.6)" letter-spacing="3">fotiqo</text>
  <!-- Tagline -->
  <text x="177" y="148" font-family="system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.35)" letter-spacing="4" text-transform="uppercase">PROOF • DO NOT COPY</text>
</svg>`;

async function main() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error(
      "Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
    );
    process.exit(1);
  }

  console.log(
    `Uploading watermark to Cloudinary cloud "${process.env.CLOUDINARY_CLOUD_NAME}"...`
  );

  // Convert SVG to data URI for upload
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(WATERMARK_SVG).toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      public_id: "fotiqo_watermark",
      resource_type: "image",
      overwrite: true,
      invalidate: true, // Purge CDN cache
    });

    console.log("Watermark uploaded successfully!");
    console.log(`  Public ID: ${result.public_id}`);
    console.log(`  URL: ${result.secure_url}`);
    console.log(`  Size: ${result.width}x${result.height}`);
    console.log(`  Format: ${result.format}`);
    console.log("");
    console.log(
      "To use in overlays: l_fotiqo_watermark,w_0.5,g_center,o_40"
    );
  } catch (error: any) {
    console.error("Upload failed:", error.message || error);
    process.exit(1);
  }
}

main();
