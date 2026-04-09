import { prisma } from "@/lib/db";
import { Sparkles, Wand2, BarChart3 } from "lucide-react";
import MagicElementsClient from "./MagicElementsClient";

export const dynamic = "force-dynamic";

export default async function MagicElementsPage() {
  const elements = await prisma.magicElement.findMany({
    orderBy: [{ isActive: "desc" }, { usageCount: "desc" }, { name: "asc" }],
  });
  const active = elements.filter((e) => e.isActive).length;
  const totalUses = elements.reduce((s, e) => s + (e.usageCount || 0), 0);

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">AI</div>
        <h1 className="heading text-4xl mt-1">Magic Elements</h1>
        <p className="text-navy-400 mt-1">
          AR overlays customers can apply to their photos for an extra €5–€8 per shot.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-brand-500/10 text-brand-700 flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Library size</div>
          <div className="font-display text-3xl text-navy-900">{elements.length}</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
            <Wand2 className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Active</div>
          <div className="font-display text-3xl text-navy-900">{active}</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-coral-500/10 text-coral-600 flex items-center justify-center">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Total applications</div>
          <div className="font-display text-3xl text-navy-900">{totalUses}</div>
        </div>
      </div>

      <MagicElementsClient
        elements={elements.map((e) => ({
          id: e.id,
          name: e.name,
          slug: e.slug,
          description: e.description,
          type: e.type,
          category: e.category,
          position: e.position,
          assetUrl: e.assetUrl,
          isActive: e.isActive,
          usageCount: e.usageCount,
        }))}
      />
    </div>
  );
}
