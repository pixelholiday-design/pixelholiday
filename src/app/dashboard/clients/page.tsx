import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Users, Mail, Phone, Camera, DollarSign, Calendar, Search, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login/photographer");
  const userId = (session.user as any).id;

  // Get photographer's galleries and their customers
  const galleries = await prisma.gallery.findMany({
    where: { photographerId: userId },
    select: {
      id: true,
      createdAt: true,
      status: true,
      customer: {
        select: { id: true, name: true, email: true, whatsapp: true, roomNumber: true, createdAt: true },
      },
      _count: { select: { photos: true } },
      order: { select: { amount: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Aggregate clients from galleries
  const clientMap = new Map<string, {
    id: string; name: string; email: string | null; phone: string | null;
    sessions: number; photos: number; revenue: number; lastSession: Date;
  }>();

  for (const g of galleries) {
    const c = g.customer;
    if (!c) continue;
    const existing = clientMap.get(c.id);
    const orderAmount = g.order?.status === "COMPLETED" ? (g.order.amount || 0) : 0;
    if (existing) {
      existing.sessions++;
      existing.photos += g._count.photos;
      existing.revenue += orderAmount;
      if (g.createdAt > existing.lastSession) existing.lastSession = g.createdAt;
    } else {
      clientMap.set(c.id, {
        id: c.id,
        name: c.name || "Unknown",
        email: c.email,
        phone: c.whatsapp,
        sessions: 1,
        photos: g._count.photos,
        revenue: orderAmount,
        lastSession: g.createdAt,
      });
    }
  }

  const clients = Array.from(clientMap.values()).sort((a, b) => b.lastSession.getTime() - a.lastSession.getTime());
  const totalRevenue = clients.reduce((s, c) => s + c.revenue, 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy-900">Clients</h1>
          <p className="text-navy-500 text-sm mt-1">{clients.length} clients &middot; &euro;{totalRevenue.toFixed(0)} total revenue</p>
        </div>
        <Link href="/dashboard/clients/new" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Client
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-brand-500" />
            <div>
              <div className="font-display text-2xl text-navy-900">{clients.length}</div>
              <div className="text-xs text-navy-400">Total clients</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5 text-coral-500" />
            <div>
              <div className="font-display text-2xl text-navy-900">{galleries.length}</div>
              <div className="text-xs text-navy-400">Total sessions</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-500" />
            <div>
              <div className="font-display text-2xl text-navy-900">&euro;{totalRevenue.toFixed(0)}</div>
              <div className="text-xs text-navy-400">Total revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Client list */}
      {clients.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 mx-auto text-navy-300 mb-3" />
          <p className="text-navy-500 font-medium">No clients yet</p>
          <p className="text-sm text-navy-400 mt-1">Clients appear here automatically when you create galleries for them.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-5 py-3 bg-cream-50 border-b border-cream-200 text-xs font-semibold text-navy-500 uppercase tracking-wide">
            <div>Client</div>
            <div>Sessions</div>
            <div>Photos</div>
            <div>Revenue</div>
            <div>Last session</div>
          </div>
          {clients.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-5 py-4 border-b border-cream-100 items-center hover:bg-cream-50 transition">
              <div>
                <div className="font-semibold text-navy-900 text-sm">{c.name}</div>
                <div className="text-xs text-navy-400 flex items-center gap-3 mt-0.5">
                  {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                  {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                </div>
              </div>
              <div className="text-sm text-navy-700 text-center">{c.sessions}</div>
              <div className="text-sm text-navy-700 text-center">{c.photos}</div>
              <div className="text-sm font-semibold text-navy-900 text-center">&euro;{c.revenue.toFixed(0)}</div>
              <div className="text-xs text-navy-400 text-right">{c.lastSession.toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
