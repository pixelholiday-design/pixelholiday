import { prisma } from "@/lib/db";
import { liveStream, type LiveEvent } from "@/lib/live-stream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/location/[locationId]/stream — Location-wide SSE stream.
 *
 * Used by kiosk TV displays to show a live photo wall of ALL sessions
 * happening at this location. Every time ANY photographer uploads to ANY
 * gallery at this location, the TV display gets notified.
 */
export async function GET(
  req: Request,
  { params }: { params: { locationId: string } },
) {
  const { locationId } = params;

  // Validate location exists
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: { id: true, name: true },
  });
  if (!location) {
    return new Response("Location not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send(event: LiveEvent) {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        } catch {}
      }

      send({ type: "connected", galleryToken: `location:${locationId}` });

      const unsub = liveStream.subscribeLocation(locationId, send);

      const heartbeat = setInterval(() => {
        send({ type: "heartbeat" });
      }, 25_000);

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
      "X-Accel-Buffering": "no",
    },
  });
}
