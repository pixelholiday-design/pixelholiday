"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Plus, X, Briefcase, Camera, CircleDot,
  Zap, Triangle, HardDrive, Battery, BatteryCharging, Tablet, Printer, Monitor,
  CheckCircle2, Wrench, Package,
} from "lucide-react";

type Equipment = {
  id: string;
  name: string;
  type: string;
  serialNumber: string | null;
  purchaseCost: number | null;
  status: string;
  location: { id: string; name: string } | null;
  assignments: {
    id: string;
    user: { id: string; name: string; role: string };
  }[];
};

const EQUIPMENT_TYPES = [
  { value: "CAMERA", label: "Camera", icon: Camera },
  { value: "LENS", label: "Lens", icon: CircleDot },
  { value: "FLASH", label: "Flash", icon: Zap },
  { value: "TRIPOD", label: "Tripod", icon: Triangle },
  { value: "MEMORY_CARD", label: "Memory Card", icon: HardDrive },
  { value: "BATTERY", label: "Battery", icon: Battery },
  { value: "CHARGER", label: "Charger", icon: BatteryCharging },
  { value: "TABLET", label: "Tablet", icon: Tablet },
  { value: "PRINTER", label: "Printer", icon: Printer },
  { value: "KIOSK_SCREEN", label: "Kiosk Screen", icon: Monitor },
];

function getTypeIcon(type: string) {
  return EQUIPMENT_TYPES.find((t) => t.value === type)?.icon || Package;
}

function getTypeLabel(type: string) {
  return EQUIPMENT_TYPES.find((t) => t.value === type)?.label || type;
}

export default function EquipmentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#0EA5A5");
  const [companyName, setCompanyName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [dashRes, eqRes] = await Promise.all([
        fetch(`/api/v/${slug}/dashboard`),
        fetch("/api/admin/equipment"),
      ]);
      if (!dashRes.ok) { router.push(`/v/${slug}`); return; }
      const dashData = await dashRes.json();
      const eqData = eqRes.ok ? await eqRes.json() : { equipment: [] };

      setPrimaryColor(dashData.org?.brandPrimaryColor || "#0EA5A5");
      setCompanyName(dashData.org?.brandName || dashData.org?.name || "Company");
      setEquipment(eqData.equipment || []);
    } catch {
      router.push(`/v/${slug}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  const total = equipment.length;
  const assigned = equipment.filter((e) => e.status === "ASSIGNED").length;
  const available = equipment.filter((e) => e.status === "AVAILABLE").length;
  const maintenance = equipment.filter((e) => e.status === "MAINTENANCE").length;

  // Group by type
  const typeGroups = EQUIPMENT_TYPES.map((t) => ({
    ...t,
    items: equipment.filter((e) => e.type === t.value),
  })).filter((g) => g.items.length > 0);

  // Add an "Other" group for unrecognized types
  const knownTypes = new Set(EQUIPMENT_TYPES.map((t) => t.value));
  const otherItems = equipment.filter((e) => !knownTypes.has(e.type));
  if (otherItems.length > 0) {
    typeGroups.push({ value: "OTHER", label: "Other", icon: Package, items: otherItems });
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <Link href={`/v/${slug}/dashboard`} className="text-xs text-navy-400 hover:text-brand-500 flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3 w-3" /> Back to {companyName}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl text-navy-900">Equipment</h1>
              <p className="text-sm text-navy-400">{total} items tracked</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90"
              style={{ background: primaryColor }}
            >
              <Plus className="h-4 w-4" /> Add Equipment
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Briefcase, label: "Total Items", value: total },
            { icon: CheckCircle2, label: "Available", value: available },
            { icon: Camera, label: "Assigned", value: assigned },
            { icon: Wrench, label: "Maintenance", value: maintenance },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card p-4">
                <Icon className="h-4 w-4 mb-1" style={{ color: primaryColor }} />
                <div className="font-display text-xl text-navy-900">{s.value}</div>
                <div className="text-xs text-navy-400">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Equipment by Type */}
        {total === 0 ? (
          <div className="card p-10 text-center">
            <Briefcase className="h-12 w-12 text-navy-300 mx-auto mb-4" />
            <h3 className="font-display text-lg text-navy-900 mb-2">No equipment yet</h3>
            <p className="text-sm text-navy-400 mb-6 max-w-md mx-auto">
              Track cameras, lenses, tablets, and other gear assigned to your team.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition hover:opacity-90"
              style={{ background: primaryColor }}
            >
              <Plus className="h-5 w-5" /> Add Your First Equipment
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {typeGroups.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.value}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4" style={{ color: primaryColor }} />
                    <h2 className="font-display text-lg text-navy-900">{group.label}</h2>
                    <span className="text-xs text-navy-400 bg-cream-200 px-2 py-0.5 rounded-full">{group.items.length}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.items.map((item) => {
                      const statusColor =
                        item.status === "AVAILABLE" ? "text-emerald-600 bg-emerald-50" :
                        item.status === "ASSIGNED" ? "text-blue-600 bg-blue-50" :
                        item.status === "MAINTENANCE" ? "text-amber-600 bg-amber-50" :
                        "text-navy-400 bg-cream-100";
                      return (
                        <div key={item.id} className="card p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-navy-900 text-sm">{item.name}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
                              {item.status}
                            </span>
                          </div>
                          {item.serialNumber && (
                            <p className="text-xs text-navy-400 mb-1">S/N: {item.serialNumber}</p>
                          )}
                          {item.purchaseCost != null && (
                            <p className="text-xs text-navy-400 mb-1">Cost: EUR {item.purchaseCost.toFixed(2)}</p>
                          )}
                          {item.location && (
                            <p className="text-xs text-navy-400 mb-1">{item.location.name}</p>
                          )}
                          {item.assignments.length > 0 && (
                            <div className="mt-2 text-xs font-medium px-2 py-0.5 rounded-full inline-block" style={{ background: primaryColor + "15", color: primaryColor }}>
                              {item.assignments[0].user.name}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showCreate && (
        <AddEquipmentModal
          primaryColor={primaryColor}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchData(); }}
        />
      )}
    </div>
  );
}

/* ─── Add Equipment Modal ─────────────────────────── */

function AddEquipmentModal({
  primaryColor,
  onClose,
  onCreated,
}: {
  primaryColor: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("CAMERA");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          model: name.trim(),
          serialNumber: serialNumber || undefined,
          purchaseCost: purchaseCost || undefined,
          locationId: "default", // Will need a real locationId in production
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to add equipment"); setSaving(false); return; }
      onCreated();
    } catch {
      setError("Network error");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <h2 className="font-display text-xl text-navy-900">Add Equipment</h2>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT_TYPES.map((t) => {
                const Icon = t.icon;
                const selected = type === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition ${
                      selected ? "text-white" : "border-cream-200 text-navy-600 hover:border-cream-400"
                    }`}
                    style={selected ? { background: primaryColor, borderColor: primaryColor } : {}}
                  >
                    <Icon className="h-4 w-4" /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Name / Model</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nikon D7000 #3"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Serial Number */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Serial Number <span className="text-navy-400">(optional)</span></label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g. ABC123456"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Purchase Cost */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Purchase Cost (EUR) <span className="text-navy-400">(optional)</span></label>
            <input
              type="number"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              placeholder="e.g. 1200"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
        </div>

        <div className="flex gap-3 p-6 border-t border-cream-200">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-cream-300 text-navy-600 text-sm font-medium hover:bg-cream-100 transition">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{ background: primaryColor }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Add Equipment"}
          </button>
        </div>
      </div>
    </div>
  );
}
