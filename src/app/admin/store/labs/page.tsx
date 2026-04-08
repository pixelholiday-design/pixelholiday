import { prisma } from "@/lib/db";
import { Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PrintLabsPage() {
  const labs = await prisma.printLabConfig.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Store</div>
        <h1 className="heading text-4xl mt-1">Print labs</h1>
        <p className="text-navy-400 mt-1">Configure self-fulfillment and 3rd-party print fulfillment.</p>
      </header>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Configured labs</h2>
        </div>
        {labs.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="h-8 w-8 text-coral-500 mx-auto mb-3" />
            <div className="font-display text-xl text-navy-900">No print labs yet</div>
            <div className="text-sm text-navy-400 mt-1">Add a LOCAL lab below to start self-fulfilling, or wire up a 3rd party.</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Markup</th>
                <th className="px-6 py-3">API URL</th>
                <th className="px-6 py-3">Default</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {labs.map((l) => (
                <tr key={l.id} className="hover:bg-cream-100/60">
                  <td className="px-6 py-3 font-medium text-navy-900">{l.name}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center rounded-full bg-coral-50 text-coral-700 text-xs font-semibold px-2.5 py-1">{l.type}</span>
                  </td>
                  <td className="px-6 py-3 text-navy-600">{l.markupPercent}%</td>
                  <td className="px-6 py-3 text-navy-500 text-xs font-mono">{l.apiBaseUrl || "—"}</td>
                  <td className="px-6 py-3">{l.isDefault ? "★" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-6">
        <h2 className="heading text-lg mb-4">Add a print lab</h2>
        <form action="/api/admin/store/labs" method="POST" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <div className="label-xs mb-1.5">Name</div>
            <input className="input" name="name" placeholder="Local Lab Tunis" required />
          </label>
          <label className="block">
            <div className="label-xs mb-1.5">Type</div>
            <select className="input" name="type" required>
              <option value="LOCAL">Local (self-fulfilled)</option>
              <option value="PRODIGI">Prodigi</option>
              <option value="PRINTFUL">Printful</option>
              <option value="GOOTEN">Gooten</option>
              <option value="CUSTOM_API">Custom API</option>
            </select>
          </label>
          <label className="block">
            <div className="label-xs mb-1.5">API base URL (optional)</div>
            <input className="input" name="apiBaseUrl" placeholder="https://api.example.com" />
          </label>
          <label className="block">
            <div className="label-xs mb-1.5">Markup %</div>
            <input type="number" className="input" name="markupPercent" defaultValue="50" />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary">Add lab</button>
          </div>
        </form>
      </div>
    </div>
  );
}
