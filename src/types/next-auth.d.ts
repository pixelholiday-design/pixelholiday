import "next-auth";
import "next-auth/jwt";
import { StaffRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: StaffRole;
      orgId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: StaffRole;
    orgId?: string;
  }
}
