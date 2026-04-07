import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  return (
    <AdminShell user={{ name: user?.name || "Studio", email: user?.email || "", role: user?.role || "STAFF" }}>
      {children}
    </AdminShell>
  );
}
