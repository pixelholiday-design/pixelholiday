import { prisma } from "@/lib/db";

export default async function MagicElementsPage() {
  const elements = await prisma.magicElement.findMany().catch(() => []);
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Magic Element Library</h1>
      <form action="/api/admin/magic-elements" method="POST" className="grid grid-cols-2 gap-3 max-w-xl mb-8 p-4 border rounded">
        <input name="name" placeholder="Name (e.g. Pirate Parrot)" className="border p-2" required />
        <select name="type" className="border p-2">
          <option value="THREE_D_CHARACTER">3D Character</option>
          <option value="AR_OVERLAY">AR Overlay</option>
          <option value="BACKGROUND_REPLACE">Background Replace</option>
          <option value="GRAPHIC_OVERLAY">Graphic Overlay</option>
        </select>
        <input name="assetUrl" placeholder="Asset URL" className="border p-2 col-span-2" required />
        <input name="category" placeholder="Category" className="border p-2 col-span-2" />
        <button className="bg-black text-white p-2 col-span-2">Add Element</button>
      </form>
      <table className="w-full border">
        <thead><tr className="bg-gray-100"><th className="p-2">Name</th><th>Type</th><th>Category</th><th>Active</th></tr></thead>
        <tbody>
          {elements.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="p-2">{e.name}</td>
              <td>{e.type}</td>
              <td>{e.category ?? "—"}</td>
              <td>{e.isActive ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
