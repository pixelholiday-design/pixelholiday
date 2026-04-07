import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token as any;
    const role = token?.role as string | undefined;

    // RBAC: photographers can access kiosk + upload + their own dashboard,
    // but the CEO/ops routes are restricted.
    const restricted = [
      "/admin/staff",
      "/admin/equipment",
      "/admin/housing",
      "/admin/franchise",
      "/admin/b2b",
      "/admin/hr",
      "/admin/ai-insights",
    ];
    if (restricted.some((p) => pathname.startsWith(p))) {
      if (!["CEO", "OPERATIONS_MANAGER", "SUPERVISOR"].includes(role || "")) {
        return NextResponse.redirect(new URL("/my-dashboard", req.url));
      }
    }
    return NextResponse.next();
  },
  { pages: { signIn: "/login" } }
);

export const config = {
  matcher: ["/admin/:path*", "/kiosk/:path*", "/my-dashboard/:path*"],
};
