import { NextResponse } from "next/server";

/**
 * CORS headers for kiosk API routes. Gallery kiosks on a different IP
 * make cross-origin requests to the sale-point's Next.js server.
 */
export const KIOSK_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

/** Standard CORS preflight response */
export function kioskOptions() {
  return new NextResponse(null, { status: 204, headers: KIOSK_CORS });
}

/** Wrap a JSON response with CORS headers */
export function kioskJson(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status, headers: KIOSK_CORS });
}
