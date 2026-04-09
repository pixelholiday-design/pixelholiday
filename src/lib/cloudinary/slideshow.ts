/**
 * Cloudinary Video Slideshow URL Generator
 *
 * Creates real MP4 video slideshows from a set of images using Cloudinary's
 * fn_render video generation feature with the CLT (Cloudinary Layout Template).
 *
 * Supports both Cloudinary public IDs and external HTTPS URLs (via fetch).
 */

export interface ReelOptions {
  width?: number; // default: 1080
  height?: number; // default: 1920 (portrait for mobile)
  duration?: number; // total seconds, default: photos.length * 3
  slideDuration?: number; // ms per slide, default: 3000
  transitionDuration?: number; // ms per transition, default: 1500
  transition?:
    | "crossfade"
    | "wipeleft"
    | "wiperight"
    | "pixelize"
    | "circleopen";
  format?: "mp4" | "webm";
}

const DEFAULTS: Required<ReelOptions> = {
  width: 1080,
  height: 1920,
  duration: 0, // computed from photos
  slideDuration: 3000,
  transitionDuration: 1500,
  transition: "crossfade",
  format: "mp4",
};

function isHttpsUrl(s: string): boolean {
  return /^https?:\/\//.test(s);
}

/**
 * Encode a single slide source for the fn_render URL.
 *
 * - Cloudinary public IDs are used as-is.
 * - HTTPS URLs use the `fetch:` prefix so Cloudinary pulls the remote image.
 */
function encodeSlideSource(source: string): string {
  if (isHttpsUrl(source)) {
    return `fetch:${encodeURIComponent(source)}`;
  }
  return source;
}

/**
 * Generate a Cloudinary video slideshow URL that produces a real MP4.
 *
 * Uses the fn_render transformation with a CLT (Cloudinary Layout Template)
 * to create a video from static images with transitions.
 *
 * @param cloudName - Cloudinary cloud name
 * @param photoSources - Array of Cloudinary public IDs or full HTTPS URLs
 * @param options - Slideshow configuration
 * @returns The full Cloudinary video URL, or empty string if unconfigured
 */
export function generateSlideshowUrl(
  cloudName: string,
  photoSources: string[],
  options?: ReelOptions,
): string {
  if (!cloudName || cloudName === "demo") {
    console.warn(
      "[Slideshow] Cloudinary not configured — skipping video URL generation",
    );
    return "";
  }

  if (photoSources.length === 0) {
    console.warn("[Slideshow] No photo sources provided");
    return "";
  }

  const opts = { ...DEFAULTS, ...options };
  const totalDur =
    opts.duration > 0 ? opts.duration * 1000 : photoSources.length * opts.slideDuration;

  // Build individual slide descriptors
  // Each slide: (media_i_(type_image;src_{source}))
  const slides = photoSources
    .map((src) => {
      const encoded = encodeSlideSource(src);
      return `(media_i_(type_image;src_${encoded}))`;
    })
    .join("");

  // Build the fn_render parameter string
  // Format: fn_render:w_{w};h_{h};du_{totalDur};vars_(sdur_{slideDur};tdur_{transDur};transition_s_(name_{transition})(slides_s_{slides}))
  const renderParams = [
    `w_${opts.width}`,
    `h_${opts.height}`,
    `du_${totalDur}`,
    `vars_(sdur_${opts.slideDuration}`,
    `tdur_${opts.transitionDuration}`,
    `transition_s_(name_${opts.transition})`,
    `slides_s_${slides})`,
  ].join(";");

  const fnRender = `fn_render:${renderParams}`;
  const formatParams = `f_${opts.format === "webm" ? "webm" : "mp4"},q_auto`;

  return `https://res.cloudinary.com/${cloudName}/video/upload/${fnRender}/${formatParams}/fotiqo_slideshow_template.mp4`;
}

/**
 * Generate a JSON manifest object for Cloudinary's explicit API.
 *
 * This can be used with the Cloudinary Admin API to create a video
 * via the explicit endpoint rather than a URL-based transformation.
 */
export function generateSlideshowManifest(
  photoSources: string[],
  options?: ReelOptions,
): object {
  const opts = { ...DEFAULTS, ...options };
  const totalDur =
    opts.duration > 0 ? opts.duration * 1000 : photoSources.length * opts.slideDuration;

  const slides = photoSources.map((src) => {
    if (isHttpsUrl(src)) {
      return {
        media: { type: "image", src: src, fetch: true },
      };
    }
    return {
      media: { type: "image", src: src },
    };
  });

  return {
    template: "fotiqo_slideshow_template",
    width: opts.width,
    height: opts.height,
    duration: totalDur,
    variables: {
      slideDuration: opts.slideDuration,
      transitionDuration: opts.transitionDuration,
      transition: { name: opts.transition },
    },
    slides,
  };
}

/**
 * Ensure the Cloudinary slideshow CLT template exists.
 *
 * Downloads the official Cloudinary slideshow template and uploads it
 * as a raw asset under the public ID `fotiqo_slideshow_template`.
 *
 * @returns The public_id of the template, or null if Cloudinary is not configured
 */
export async function ensureSlideshowTemplate(
  cloudName: string,
): Promise<string | null> {
  if (!cloudName || cloudName === "demo") {
    console.warn(
      "[Slideshow] Cloudinary not configured — cannot set up template",
    );
    return null;
  }

  if (
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.warn(
      "[Slideshow] CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET missing — cannot upload template",
    );
    return null;
  }

  try {
    // Dynamic import to keep this file safe for edge/client bundling scenarios
    const { cloudinary } = await import("@/lib/cloudinary.server");

    const PUBLIC_ID = "fotiqo_slideshow_template";
    const TEMPLATE_URL =
      "https://res.cloudinary.com/prod/raw/upload/docs/slideshow.clt";

    // Check if the template already exists
    try {
      const existing = await cloudinary.api.resource(PUBLIC_ID, {
        resource_type: "raw",
      });
      if (existing?.public_id) {
        console.log(
          `[Slideshow] Template already exists: ${existing.public_id}`,
        );
        return existing.public_id;
      }
    } catch {
      // Resource doesn't exist — proceed to upload
    }

    // Upload the CLT template
    const result = await cloudinary.uploader.upload(TEMPLATE_URL, {
      public_id: PUBLIC_ID,
      resource_type: "raw",
      overwrite: true,
    });

    console.log(
      `[Slideshow] Template uploaded: ${result.public_id} (${result.bytes} bytes)`,
    );
    return result.public_id;
  } catch (err) {
    console.error("[Slideshow] Failed to ensure template:", err);
    return null;
  }
}
