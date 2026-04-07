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
    "/admin/wifi-transfer",
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
// Sale-point and SD-upload have their own PIN gate so they're public at the URL level.
const PUBLIC_KIOSK = [
  "/kiosk/self-service",
  "/kiosk/tv-display",
  "/kiosk/gallery",
  "/kiosk/sale-point",
  "/kiosk/sd-upload",
  "/kiosk/print-queue",
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token as any;
    const role = token?.role as string | undefined;

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
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/kiosk/:path*", "/my-dashboard/:path*"],
};
