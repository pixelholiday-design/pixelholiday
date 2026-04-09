import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function FranchisePage() {
  const franchises = await prisma.organization.findMany({
    where: { type: "FRANCHISE" },
    include: { locations: true, staff: true, children: true },
  }).catch(() => []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Franchise Management</h1>
          <p className="text-sm text-slate-600">Manage franchise organizations, white-label branding, and revenue sharing.</p>
        </div>
        <Link
          href="/admin/franchise/new"
          className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800"
        >
          + New Franchise
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Locations</th>
              <th className="text-left p-3">Staff</th>
              <th className="text-left p-3">Commission</th>
              <th className="text-left p-3">Branding</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {franchises.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No franchises yet.{" "}
                  <Link href="/admin/franchise/new" className="text-brand-400 underline">
                    Create your first franchise
                  </Link>
                </td>
              </tr>
            ) : (
              franchises.map((f: any) => (
                <tr key={f.id} className="border-t">
                  <td className="p-3 font-medium">
                    {f.brandColor && (
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: f.brandColor }}
                      />
                    )}
                    {f.name}
                  </td>
                  <td className="p-3">{f.locations.length}</td>
                  <td className="p-3">{f.staff.length}</td>
                  <td className="p-3">{(f.saasCommissionRate * 100).toFixed(1)}%</td>
                  <td className="p-3">
                    <Link href={`/admin/franchise/${f.id}/branding`} className="text-brand-400 text-xs">
                      Edit branding
                    </Link>
                  </td>
                  <td className="p-3">
                    <Link className="text-brand-400" href={`/admin/franchise/${f.id}`}>
                      Dashboard
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
