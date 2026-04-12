"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Plus, X, Loader2, ArrowLeft, Mail, Phone, Shield,
  Camera, UserCheck, GraduationCap, Store, Star,
} from "lucide-react";

type StaffMember = {
  id: string;
  userId: string;
  role: string;
  pin: string | null;
  isActive: boolean;
  user: { id: string; name: string; email: string; phone: string | null };
  destination: { id: string; name: string; slug: string } | null;
};

type Destination = {
  id: string;
  name: string;
  slug: string;
  venueType: string;
};

const STAFF_ROLES = [
  { value: "PHOTOGRAPHER", label: "Photographer", icon: Camera },
  { value: "SALES_STAFF", label: "Sales Staff", icon: Store },
  { value: "SUPERVISOR", label: "Supervisor", icon: Shield },
  { value: "OPERATIONS_MANAGER", label: "Operations Manager", icon: Star },
  { value: "RECEPTIONIST", label: "Receptionist", icon: UserCheck },
  { value: "ACADEMY_TRAINEE", label: "Trainee", icon: GraduationCap },
];

export default function StaffPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#0EA5A5");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [dashRes, staffRes] = await Promise.all([
        fetch(`/api/v/${slug}/dashboard`),
        fetch("/api/destination-staff"),
      ]);
      if (!dashRes.ok) { router.push(`/v/${slug}`); return; }
      const dashData = await dashRes.json();
      const staffData = staffRes.ok ? await staffRes.json() : { staff: [] };

      setPrimaryColor(dashData.org?.brandPrimaryColor || "#0EA5A5");
      setCompanyName(dashData.org?.brandName || dashData.org?.name || "Company");
      setDestinations(dashData.destinations || []);
      setStaff(staffData.staff || []);
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

  const activeStaff = staff.filter((s) => s.isActive);
  const roleGroups = STAFF_ROLES.map((r) => ({
    ...r,
    members: activeStaff.filter((s) => s.role === r.value),
  })).filter((r) => r.members.length > 0);

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <Link href={`/v/${slug}/dashboard`} className="text-xs text-navy-400 hover:text-brand-500 flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3 w-3" /> Back to {companyName}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl text-navy-900">Staff Management</h1>
              <p className="text-sm text-navy-400">{activeStaff.length} active members</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90"
              style={{ background: primaryColor }}
            >
              <Plus className="h-4 w-4" /> Add Staff
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STAFF_ROLES.slice(0, 4).map((role) => {
            const count = activeStaff.filter((s) => s.role === role.value).length;
            const Icon = role.icon;
            return (
              <div key={role.value} className="card p-4">
                <Icon className="h-4 w-4 mb-1" style={{ color: primaryColor }} />
                <div className="font-display text-xl text-navy-900">{count}</div>
                <div className="text-xs text-navy-400">{role.label}s</div>
              </div>
            );
          })}
        </div>

        {activeStaff.length === 0 ? (
          <div className="card p-10 text-center">
            <Users className="h-12 w-12 text-navy-300 mx-auto mb-4" />
            <h3 className="font-display text-lg text-navy-900 mb-2">No staff yet</h3>
            <p className="text-sm text-navy-400 mb-6 max-w-md mx-auto">
              Add photographers, sales staff, and supervisors to your team.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition hover:opacity-90"
              style={{ background: primaryColor }}
            >
              <Plus className="h-5 w-5" /> Add Your First Team Member
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {roleGroups.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.value}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4" style={{ color: primaryColor }} />
                    <h2 className="font-display text-lg text-navy-900">{group.label}s</h2>
                    <span className="text-xs text-navy-400 bg-cream-200 px-2 py-0.5 rounded-full">{group.members.length}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.members.map((member) => (
                      <div key={member.id} className="card p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: primaryColor }}>
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                          {member.pin && (
                            <span className="text-xs text-navy-400 bg-cream-100 px-2 py-0.5 rounded">PIN: {member.pin}</span>
                          )}
                        </div>
                        <h3 className="font-medium text-navy-900">{member.user.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-navy-400 mt-1">
                          <Mail className="h-3 w-3" /> {member.user.email}
                        </div>
                        {member.user.phone && (
                          <div className="flex items-center gap-1 text-xs text-navy-400 mt-0.5">
                            <Phone className="h-3 w-3" /> {member.user.phone}
                          </div>
                        )}
                        {member.destination && (
                          <div className="mt-2 text-xs font-medium px-2 py-0.5 rounded-full inline-block" style={{ background: primaryColor + "15", color: primaryColor }}>
                            {member.destination.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateStaffModal
          slug={slug}
          primaryColor={primaryColor}
          destinations={destinations}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchData(); }}
        />
      )}
    </div>
  );
}

/* ─── Create Staff Modal ─────────────────────────── */

function CreateStaffModal({
  slug,
  primaryColor,
  destinations,
  onClose,
  onCreated,
}: {
  slug: string;
  primaryColor: string;
  destinations: Destination[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PHOTOGRAPHER");
  const [pin, setPin] = useState("");
  const [selectedDests, setSelectedDests] = useState<string[]>(
    destinations.length === 1 ? [destinations[0].id] : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleDest(id: string) {
    setSelectedDests((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  async function handleCreate() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email, and password are required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (selectedDests.length === 0) {
      setError("Select at least one destination");
      return;
    }
    if (pin && pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/destination-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          pin: pin || undefined,
          destinationIds: selectedDests,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create staff member");
        setSaving(false);
        return;
      }
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
          <h2 className="font-display text-xl text-navy-900">Add Staff Member</h2>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {STAFF_ROLES.map((r) => {
                const Icon = r.icon;
                const selected = role === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition ${
                      selected ? "text-white" : "border-cream-200 text-navy-600 hover:border-cream-400"
                    }`}
                    style={selected ? { background: primaryColor, borderColor: primaryColor } : {}}
                  >
                    <Icon className="h-4 w-4" /> {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maria Papadopoulos"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@pixelholiday.com"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* PIN */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Kiosk PIN <span className="text-navy-400">(optional, 4 digits)</span></label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="e.g. 1234"
              maxLength={4}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Destination Assignment */}
          {destinations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">Assign to Destinations</label>
              <div className="space-y-2">
                {destinations.map((d) => {
                  const checked = selectedDests.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      onClick={() => toggleDest(d.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition ${
                        checked ? "border-current" : "border-cream-200 hover:border-cream-400"
                      }`}
                      style={checked ? { borderColor: primaryColor, background: primaryColor + "08" } : {}}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${checked ? "text-white" : "border-cream-300"}`} style={checked ? { background: primaryColor, borderColor: primaryColor } : {}}>
                        {checked && <span className="text-xs">✓</span>}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-navy-900">{d.name}</div>
                        <div className="text-xs text-navy-400">{d.venueType}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {destinations.length === 0 && (
                <p className="text-sm text-navy-400">Create a destination first before adding staff.</p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
        </div>

        <div className="flex gap-3 p-6 border-t border-cream-200">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-cream-300 text-navy-600 text-sm font-medium hover:bg-cream-100 transition">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim() || !email.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{ background: primaryColor }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Add Staff Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
