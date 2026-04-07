import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StaffRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  orgId: string;
};

export class GuardError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const u = session.user as any;
  if (!u.id || !u.role) return null;
  return { id: u.id, email: u.email, name: u.name, role: u.role, orgId: u.orgId };
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new GuardError(401, "Unauthorized");
  return user;
}

export async function requireRole(roles: StaffRole[]): Promise<SessionUser> {
  const user = await requireStaff();
  if (!roles.includes(user.role)) throw new GuardError(403, "Forbidden");
  return user;
}

export function handleGuardError(err: unknown) {
  if (err instanceof GuardError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  return null;
}
