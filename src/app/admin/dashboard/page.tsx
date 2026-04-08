import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CeoDashboardClient from "@/components/admin/CeoDashboardClient";
import ManagerDashboardClient from "@/components/admin/ManagerDashboardClient";
import SupervisorDashboardClient from "@/components/admin/SupervisorDashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return null;

  if (user.role === "SUPERVISOR") {
    return <SupervisorDashboardClient user={{ id: user.id, name: user.name, locationId: user.locationId }} />;
  }
  if (user.role === "OPERATIONS_MANAGER") {
    return <ManagerDashboardClient user={{ name: user.name }} />;
  }
  // CEO (and any fallthrough) sees the full command center.
  return <CeoDashboardClient />;
}
