import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PhotographerDashboardClient from "@/components/PhotographerDashboardClient";
import SalesDashboardClient from "@/components/SalesDashboardClient";
import ReceptionistDashboardClient from "@/components/ReceptionistDashboardClient";

export const dynamic = "force-dynamic";

export default async function MyDashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return null;

  if (user.role === "SALES_STAFF") return <SalesDashboardClient user={{ name: user.name }} />;
  if (user.role === "RECEPTIONIST") return <ReceptionistDashboardClient user={{ name: user.name }} />;
  // Default: photographer / trainee / CEO/OPS peeking at their own XP
  return <PhotographerDashboardClient />;
}
