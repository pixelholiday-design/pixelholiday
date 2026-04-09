import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { org: { select: { type: true } } },
        });
        if (!user || !user.password) return null;

        // Support PIN-based login: password format "pin:XXXX"
        if (credentials.password.startsWith("pin:")) {
          const pin = credentials.password.slice(4);
          if (!user.pin || user.pin !== pin) return null;
        } else {
          const ok = await bcrypt.compare(credentials.password, user.password);
          if (!ok) return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
          orgType: user.org?.type || "HEADQUARTERS",
          locationId: user.locationId,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.orgId = (user as any).orgId;
        token.orgType = (user as any).orgType;
        token.uid = (user as any).id;
        token.locationId = (user as any).locationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).role = token.role;
        (session.user as any).orgId = token.orgId;
        (session.user as any).orgType = token.orgType;
        (session.user as any).locationId = token.locationId;
      }
      return session;
    },
  },
};
