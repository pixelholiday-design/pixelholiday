import { prisma } from "@/lib/db";
import { liveStream, type LiveEvent } from "@/lib/live-stream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/gallery/[token]/stream — Server-Sent Events endpoint.
 *
 * Keeps a connection open. When a photographer uploads new photos to this
 * gallery, the customer's browser receives an event instantly — no polling.
 *
 * Events:
 *  - { type: "connected", galleryToken }
 *  - { type: "new_photos", photos: [...], totalCount }
 *  - { type: "heartbeat" }  (every 25s to keep connection alive)
 */
export async function GET(
  req: Request,
  { params }: { params: { token: string } },
) {
  const { token } = params;

  // Validate gallery exists
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: token },
    select: { id: true, status: true },
  });
  if (!gallery) {
    return new Response("Gallery not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Helper to send SSE data
      function send(event: LiveEvent) {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        } catch {
          // Controller closed — ignore
        }
      }

      // Send connected event
      send({ type: "connected", galleryToken: token });

      // Subscribe to live events for this gallery
      const unsub = liveStream.subscribeGallery(token, send);

      // Heartbeat every 25s (Vercel/CloudFlare close idle connections at ~30s)
      const heartbeat = setInterval(() => {
        send({ type: "heartbeat" });
      }, 25_000);

      // Cleanup when client disconnects
      req.signal.addEventListener("abort", () => {
        unsub();
        clearInterval(heartbeat);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
