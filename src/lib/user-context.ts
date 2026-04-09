/**
 * User context helpers for the two-business-model architecture.
 *
 * Fotiqo has two distinct products sharing one codebase:
 *   A) "Fotiqo Operations" — resort/hotel/park photography (HEADQUARTERS, FRANCHISE)
 *   B) "Fotiqo Studio" — SaaS for independent photographers (INDEPENDENT, STUDIO)
 *
 * These helpers determine which product a user belongs to and scope
 * data queries accordingly.
 */

export type UserType = "RESORT_ADMIN" | "RESORT_STAFF" | "SAAS_PHOTOGRAPHER";

export type OrgType = "HEADQUARTERS" | "FRANCHISE" | "INDEPENDENT" | "STUDIO";

/**
 * Determine the user's business context from their session data.
 */
export function getUserType(session: {
  role?: string;
  orgType?: string;
}): UserType {
  const orgType = session.orgType as OrgType | undefined;

  // Resort/venue operations
  if (orgType === "HEADQUARTERS" || orgType === "FRANCHISE") {
    const adminRoles = ["CEO", "OPERATIONS_MANAGER"];
    if (adminRoles.includes(session.role || "")) return "RESORT_ADMIN";
    return "RESORT_STAFF";
  }

  // Independent/studio photographer (SaaS)
  return "SAAS_PHOTOGRAPHER";
}

/**
 * Is this a resort/venue operation user?
 */
export function isResortUser(session: { orgType?: string }): boolean {
  return session.orgType === "HEADQUARTERS" || session.orgType === "FRANCHISE";
}

/**
 * Is this an independent SaaS photographer?
 */
export function isSaasPhotographer(session: { orgType?: string }): boolean {
  return session.orgType === "INDEPENDENT" || session.orgType === "STUDIO";
}

/**
 * Get the correct redirect URL after login based on role and org type.
 */
export function getLoginRedirect(session: {
  role?: string;
  orgType?: string;
}): string {
  const userType = getUserType(session);

  if (userType === "SAAS_PHOTOGRAPHER") {
    return "/dashboard";
  }

  if (userType === "RESORT_ADMIN") {
    return "/admin/dashboard";
  }

  // Resort staff — redirect by role
  switch (session.role) {
    case "PHOTOGRAPHER":
      return "/my-dashboard";
    case "SALES_STAFF":
      return "/kiosk/sale-point";
    case "RECEPTIONIST":
      return "/admin/bookings";
    case "ACADEMY_TRAINEE":
      return "/admin/academy";
    case "SUPERVISOR":
      return "/admin/dashboard";
    default:
      return "/my-dashboard";
  }
}
