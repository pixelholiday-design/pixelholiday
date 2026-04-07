import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Per-role allow-lists. The first matching prefix wins.
// Anything not in a role's allow-list is redirected to /my-dashboard.
const ROLE_ROUTES: Record<string, string[]> = {
  CEO: ["/admin", "/kiosk", "/my-dashboard"], // sees everything
  OPERATIONS_MANAGER: [
    "/admin/dashboard",
    "/admin/upload",
    "/admin/bookings",
    "/admin/staff",
    "/admin/equipment",
    "/admin/housing",
    "/admin/academy",
    "/admin/b2b",
    "/admin/blog",
    "/admin/reviews",
    "/admin/magic-elements",
    "/admin/retouch",
    "/admin/hr",
    "/admin/cameras",
    "/admin/kiosks",
    "/admin/kiosk-setup",
    "/admin/wifi-transfer",
    "/admin/photo-flow",
    "/admin/payroll",
    "/admin/commissions",
    "/admin/pricing",
    "/admin/cash",
    "/admin/sleeping-money",
    "/admin/store",
    "/kiosk",
    "/my-dashboard",
  ],
  SUPERVISOR: [
    "/admin/dashboard",
    "/admin/upload",
    "/admin/bookings",
    "/admin/staff",
    "/admin/equipment",
    "/admin/academy",
    "/admin/blog",
    "/admin/reviews",
    "/kiosk",
    "/my-dashboard",
  ],
  PHOTOGRAPHER: ["/admin/upload", "/admin/bookings", "/kiosk", "/my-dashboard"],
  SALES_STAFF: ["/admin/bookings", "/kiosk", "/my-dashboard"],
  RECEPTIONIST: ["/admin/bookings", "/my-dashboard"],
  ACADEMY_TRAINEE: ["/admin/academy", "/my-dashboard"],
};

function isAllowed(role: string | undefined, pathname: string): boolean {
  if (!role) return false;
  const allowed = ROLE_ROUTES[role];
  if (!allowed) return false;
  return allowed.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p));
}

// Public kiosk surfaces — no auth required (designed for unmanned displays).
// Sale-point, SD-upload, and setup have their own PIN gate so they're public at the URL level.
const PUBLIC_KIOSK = [
  "/kiosk/self-service",
  "/kiosk/tv-display",
  "/kiosk/gallery",
  "/kiosk/sale-point",
  "/kiosk/sd-upload",
  "/kiosk/print-queue",
  "/kiosk/setup",
];

// /api/admin/* is the admin REST surface — must require a session.
// Other /api/* (camera, gallery/[token], kiosk pos, mobile-upload, webhooks)
// are deliberately public; they validate via PIN, magic link, signature, etc.
function isProtectedApi(pathname: string) {
  return pathname.startsWith("/api/admin/");
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token as any;
    const role = token?.role as string | undefined;

    if (isProtectedApi(pathname)) {
      // withAuth defaults to a 307 redirect for browsers; for an API we
      // need JSON 401 / 403 instead.
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (!isAllowed(role, pathname.replace(/^\/api/, ""))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/api")) return NextResponse.next();
    if (PUBLIC_KIOSK.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
      return NextResponse.next();
    }

    if (!isAllowed(role, pathname)) {
      const target = role === "ACADEMY_TRAINEE" ? "/admin/academy" : "/my-dashboard";
      if (pathname !== target) {
        return NextResponse.redirect(new URL(target, req.url));
      }
    }
    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token, req }) => {
        const p = req.nextUrl.pathname;
        if (PUBLIC_KIOSK.some((q) => p === q || p.startsWith(q + "/"))) return true;
        // All /api/* routes pass through this callback so the middleware
        // function can return JSON instead of a 307 redirect.
        if (p.startsWith("/api/")) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/kiosk/:path*",
    "/my-dashboard/:path*",
    "/api/admin/:path*",
  ],
};
