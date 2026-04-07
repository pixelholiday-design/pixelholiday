"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ReactNode, useState } from "react";
import {
  Camera,
  LayoutDashboard,
  Upload,
  CalendarDays,
  Users,
  Package,
  Home as HomeIcon,
  GraduationCap,
  Briefcase,
  FileText,
  Star,
  Handshake,
  Building2,
  Sparkles,
  Wand2,
  Brain,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Wallet,
  Tag,
  Moon,
  Wifi,
  Printer,
  TrendingUp,
  Banknote,
  ShoppingBag,
  Truck,
  Ticket,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: any };
type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: "Operations",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/upload", label: "Upload Hub", icon: Upload },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
      { href: "/admin/cameras", label: "Cameras", icon: Camera },
      { href: "/admin/kiosks", label: "Kiosks", icon: LayoutDashboard },
    ],
  },
  {
    title: "Team",
    items: [
      { href: "/admin/staff", label: "Staff", icon: Users },
      { href: "/admin/equipment", label: "Equipment", icon: Package },
      { href: "/admin/housing", label: "Housing", icon: HomeIcon },
      { href: "/admin/academy", label: "Academy", icon: GraduationCap },
    ],
  },
  {
    title: "Business",
    items: [
      { href: "/admin/payroll", label: "Payroll", icon: Wallet },
      { href: "/admin/commissions", label: "Commissions", icon: TrendingUp },
      { href: "/admin/pricing", label: "Pricing", icon: Tag },
      { href: "/admin/cash", label: "Cash management", icon: Banknote },
      { href: "/admin/sleeping-money", label: "Sleeping money", icon: Moon },
      { href: "/admin/b2b", label: "B2B Barter", icon: Handshake },
      { href: "/admin/franchise", label: "Franchise", icon: Building2 },
      { href: "/admin/ai-insights", label: "AI Insights", icon: Brain },
      { href: "/admin/hr/jobs", label: "HR / Jobs", icon: Briefcase },
    ],
  },
  {
    title: "Store",
    items: [
      { href: "/admin/store/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/store/labs", label: "Print Labs", icon: Truck },
      { href: "/admin/store/coupons", label: "Coupons", icon: Ticket },
    ],
  },
  {
    title: "Hardware",
    items: [
      { href: "/admin/cameras", label: "Cameras", icon: Camera },
      { href: "/admin/kiosks", label: "Kiosks", icon: LayoutDashboard },
      { href: "/admin/wifi-transfer", label: "Wi-Fi routing", icon: Wifi },
      { href: "/kiosk/print-queue", label: "Print queue", icon: Printer },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/magic-elements", label: "Magic Elements", icon: Wand2 },
      { href: "/admin/retouch", label: "Retouch", icon: Sparkles },
    ],
  },
];

const ROLE_ALLOWED: Record<string, string[]> = {
  CEO: [
    "/admin/dashboard","/admin/upload","/admin/bookings","/admin/cameras","/admin/kiosks",
    "/admin/wifi-transfer","/kiosk/print-queue","/admin/staff","/admin/equipment","/admin/housing",
    "/admin/academy","/admin/payroll","/admin/commissions","/admin/pricing","/admin/cash",
    "/admin/sleeping-money","/admin/b2b","/admin/franchise","/admin/ai-insights","/admin/hr/jobs",
    "/admin/blog","/admin/reviews","/admin/magic-elements","/admin/retouch",
    "/admin/store/orders","/admin/store/labs","/admin/store/coupons",
  ],
  OPERATIONS_MANAGER: [
    "/admin/dashboard","/admin/upload","/admin/bookings","/admin/cameras","/admin/kiosks",
    "/admin/wifi-transfer","/kiosk/print-queue","/admin/staff","/admin/equipment","/admin/housing",
    "/admin/academy","/admin/payroll","/admin/commissions","/admin/pricing","/admin/cash",
    "/admin/sleeping-money","/admin/b2b","/admin/hr/jobs","/admin/blog","/admin/reviews",
    "/admin/magic-elements","/admin/retouch",
    "/admin/store/orders","/admin/store/labs","/admin/store/coupons",
  ],
  SUPERVISOR: [
    "/admin/dashboard","/admin/upload","/admin/bookings","/admin/staff","/admin/equipment",
    "/admin/academy","/admin/blog","/admin/reviews",
  ],
  PHOTOGRAPHER: ["/admin/upload","/admin/bookings"],
  SALES_STAFF: ["/admin/bookings"],
  RECEPTIONIST: ["/admin/bookings"],
  ACADEMY_TRAINEE: ["/admin/academy"],
};

export default function AdminShell({
  children,
  user,
}: {
  children: ReactNode;
  user: { name: string; email: string; role: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const allowed = ROLE_ALLOWED[user.role] || [];
  const visibleSections = SECTIONS
    .map((s) => ({ ...s, items: s.items.filter((i) => allowed.includes(i.href)) }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy-800 text-white transform transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/5">
          <div className="h-9 w-9 rounded-xl bg-coral-500/15 ring-1 ring-coral-500/30 flex items-center justify-center">
            <Camera className="h-4 w-4 text-coral-400" />
          </div>
          <span className="font-display text-xl tracking-tight">PixelHoliday</span>
        </div>
        <nav className="px-3 py-5 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin">
          {visibleSections.map((section) => (
            <div key={section.title} className="mb-6">
              <div className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                        active
                          ? "bg-coral-500/15 text-coral-300 ring-1 ring-coral-500/20"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                      {active && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-cream-100/80 backdrop-blur border-b border-cream-300/60">
          <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
            <button onClick={() => setOpen(!open)} className="btn-ghost lg:hidden -ml-2">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex-1" />
            <button className="btn-ghost relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-coral-500" />
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-cream-300/70">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-navy-900 leading-tight">{user.name}</div>
                <div className="text-[11px] text-navy-400 uppercase tracking-wider">{user.role}</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-coral-400 to-gold-500 flex items-center justify-center text-white font-semibold text-sm">
                {user.name?.charAt(0) || "?"}
              </div>
              <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn-ghost" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-10 py-8 max-w-[1600px] mx-auto animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
