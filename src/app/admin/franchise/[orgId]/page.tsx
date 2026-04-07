import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function FranchiseDashboard({ params }: { params: { orgId: string } }) {
  const org = await prisma.organization.findUnique({
    where: { id: params.orgId },
    include: { locations: true, staff: true },
  }).catch(() => null);

  if (!org) return notFound();

  const orders = await prisma.order.findMany({
    where: { gallery: { location: { orgId: org.id } }, status: "COMPLETED" },
  }).catch(() => []);

  const totalRevenue = orders.reduce((s: number, o: any) => s + o.amount, 0);
  const saasCommission = totalRevenue * org.saasCommissionRate;
  const sleepingMoneyRev = orders.filter((o: any) => o.isAutomatedSale).reduce((s: number, o: any) => s + o.amount, 0);
  const sleepingShare = sleepingMoneyRev * org.sleepingMoneyShare;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{org.name}</h1>
      <p className="text-sm text-slate-500 mb-6">Franchise Dashboard</p>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Stat label="Locations" value={org.locations.length} />
        <Stat label="Staff" value={org.staff.length} />
        <Stat label="Revenue" value={`€${totalRevenue.toFixed(2)}`} />
        <Stat label="HQ Owed" value={`€${(saasCommission + sleepingShare).toFixed(2)}`} />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-3">Revenue Sharing (Monthly)</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="py-2">Total Revenue</td><td className="text-right">€{totalRevenue.toFixed(2)}</td></tr>
            <tr className="border-b"><td className="py-2">SaaS Commission ({(org.saasCommissionRate * 100).toFixed(1)}%)</td><td className="text-right">€{saasCommission.toFixed(2)}</td></tr>
            <tr className="border-b"><td className="py-2">Sleeping Money Share ({(org.sleepingMoneyShare * 100).toFixed(0)}%)</td><td className="text-right">€{sleepingShare.toFixed(2)}</td></tr>
            <tr className="font-bold"><td className="py-2">Total Owed to HQ</td><td className="text-right">€{(saasCommission + sleepingShare).toFixed(2)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
