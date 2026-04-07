import { prisma } from "@/lib/db";

export default async function FranchisePage() {
  const franchises = await prisma.organization.findMany({
    where: { type: "FRANCHISE" },
    include: { locations: true, staff: true, children: true },
  }).catch(() => []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Franchise Management</h1>
      <p className="text-sm text-slate-600 mb-6">Manage franchise organizations, white-label branding, and revenue sharing.</p>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">Create Franchise</h2>
        <form action="/api/franchise" method="POST" className="flex gap-2">
          <input name="name" placeholder="Franchise Name" className="border rounded px-3 py-2 flex-1" required />
          <input name="parentOrgId" placeholder="HQ Org ID" className="border rounded px-3 py-2" required />
          <button className="bg-slate-900 text-white px-4 py-2 rounded">Create</button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Locations</th><th className="text-left p-3">Staff</th><th className="text-left p-3">Commission</th><th className="text-left p-3">Actions</th></tr>
          </thead>
          <tbody>
            {franchises.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500">No franchises yet. Create your first franchise above.</td></tr>
            ) : franchises.map((f: any) => (
              <tr key={f.id} className="border-t">
                <td className="p-3 font-medium">{f.name}</td>
                <td className="p-3">{f.locations.length}</td>
                <td className="p-3">{f.staff.length}</td>
                <td className="p-3">{(f.saasCommissionRate * 100).toFixed(1)}%</td>
                <td className="p-3"><a className="text-blue-600" href={`/admin/franchise/${f.id}`}>View</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
