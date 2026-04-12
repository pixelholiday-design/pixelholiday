"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Users, Loader2, Mail, Phone, Camera, Shield,
  Store, Star, UserCheck, GraduationCap, Plus,
} from "lucide-react";

type OrgInfo = {
  id: string;
  name: string;
  brandName: string | null;
  brandPrimaryColor: string | null;
};

type Destination = {
  id: string;
  name: string;
  slug: string;
  venueType: string;
};

type StaffMember = {
  id: string;
  userId: string;
  role: string;
  pin: string | null;
  isActive: boolean;
  user: { id: string; name: string; email: string; phone: string | null };
  destination: { id: string; name: string; slug: string } | null;
};

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Camera }> = {
  PHOTOGRAPHER: { label: "Photographer", icon: Camera },
  SALES_STAFF: { label: "Sales Staff", icon: Store },
  SUPERVISOR: { label: "Supervisor", icon: Shield },
  OPERATIONS_MANAGER: { label: "Operations Manager", icon: Star },
  RECEPTIONIST: { label: "Receptionist", icon: UserCheck },
  ACADEMY_TRAINEE: { label: "Trainee", icon: GraduationCap },
};

export default function DestinationStaffPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const destSlug = params.destSlug as string;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const primaryColor = org?.brandPrimaryColor || "#0EA5A5";

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, staffRes] = await Promise.all([
          fetch(`/api/v/${slug}/dashboard`),
          fetch("/api/destination-staff"),
        ]);
        if (!dashRes.ok) { router.push(`/v/${slug}`); return; }
        const dashData = await dashRes.json();
        const staffData = staffRes.ok ? await staffRes.json() : { staff: [] };

        setOrg(dashData.org);
        const dest = (dashData.destinations || []).find(
          (d: Destination) => d.slug === destSlug
        );
        setDestination(dest || null);

        // Filter staff to only this destination
        const destStaff = (staffData.staff || []).filter(
          (s: StaffMember) => s.destination?.slug === destSlug
        );
        setStaff(destStaff);
      } catch {
        router.push(`/v/${slug}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, destSlug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  const activeStaff = staff.filter((s) => s.isActive);

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href={`/v/${slug}/d/${destSlug}`}
            className="text-xs text-navy-400 hover:text-brand-500 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back to {destination?.name || "Destination"}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl text-navy-900">Destination Staff</h1>
              <p className="text-sm text-navy-400">
                {activeStaff.length} staff assigned to {destination?.name || "this destination"}
              </p>
            </div>
            <Link
              href={`/v/${slug}/staff`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90"
              style={{ background: primaryColor }}
            >
              <Plus className="h-4 w-4" /> Add Staff
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {activeStaff.length === 0 ? (
          <div className="card p-10 text-center">
            <Users className="h-12 w-12 text-navy-300 mx-auto mb-4" />
            <h3 className="font-display text-lg text-navy-900 mb-2">
              No staff assigned
            </h3>
            <p className="text-sm text-navy-400 mb-6 max-w-md mx-auto">
              Assign photographers, sales staff, and supervisors to this destination
              from the company staff page.
            </p>
            <Link
              href={`/v/${slug}/staff`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition hover:opacity-90"
              style={{ background: primaryColor }}
            >
              <Plus className="h-5 w-5" /> Go to Staff Management
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeStaff.map((member) => {
              const roleInfo = ROLE_CONFIG[member.role] || {
                label: member.role,
                icon: Users,
              };
              const RoleIcon = roleInfo.icon;

              return (
                <div key={member.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: primaryColor }}
                    >
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{
                        background: primaryColor + "15",
                        color: primaryColor,
                      }}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {roleInfo.label}
                    </span>
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
                  {member.pin && (
                    <div className="mt-2 text-xs text-navy-400 bg-cream-100 px-2 py-0.5 rounded inline-block">
                      PIN: {member.pin}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
