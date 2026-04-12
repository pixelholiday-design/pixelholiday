"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";
import NotificationBell from "./NotificationBell";
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
  MessageSquare,
  CreditCard,
  Shield,
  Film,
  Trophy,
  Megaphone,
  Lightbulb,
  HeadphonesIcon,
  SmilePlus,
  MapPin,
  Settings,
  Terminal,
  ClipboardList,
  Mail,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: any };
type NavSection = { title: string; badge?: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: "My Operations",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/upload", label: "Upload Hub", icon: Upload },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
      { href: "/admin/cameras", label: "Cameras", icon: Camera },
      { href: "/admin/kiosks", label: "Kiosks", icon: LayoutDashboard },
    ],
  },
  {
    title: "My Team",
    items: [
      { href: "/admin/email", label: "Email", icon: Mail },
      { href: "/admin/chat", label: "Team Chat", icon: MessageSquare },
      { href: "/admin/staff", label: "Staff", icon: Users },
      { href: "/admin/shifts", label: "Shifts", icon: CalendarDays },
      { href: "/admin/equipment", label: "Equipment", icon: Package },
      { href: "/admin/housing", label: "Housing", icon: HomeIcon },
      { href: "/admin/academy", label: "Academy", icon: GraduationCap },
    ],
  },
  {
    title: "Finance",
    items: [
      { href: "/admin/payroll", label: "Payroll", icon: Wallet },
      { href: "/admin/commissions", label: "Commissions", icon: TrendingUp },
      { href: "/admin/pricing", label: "Pricing", icon: Tag },
      { href: "/admin/cash", label: "Cash management", icon: Banknote },
      { href: "/admin/finance", label: "Finance", icon: Wallet },
      { href: "/admin/sleeping-money", label: "Sleeping money", icon: Moon },
      { href: "/admin/payouts", label: "Payouts", icon: Banknote },
      { href: "/admin/packages", label: "Packages", icon: Package },
    ],
  },
  {
    title: "Venue Network",
    items: [
      { href: "/admin/b2b", label: "B2B Barter", icon: Handshake },
      { href: "/admin/companies-manage", label: "Companies", icon: Building2 },
      { href: "/admin/franchise", label: "Franchise", icon: Building2 },
      { href: "/admin/hotel-integration", label: "Hotel Integration", icon: Building2 },
    ],
  },
  {
    title: "Platform",
    badge: "SaaS",
    items: [
      { href: "/admin/ai-insights", label: "AI Insights", icon: Brain },
      { href: "/admin/fraud-alerts", label: "Fraud Alerts", icon: Shield },
      { href: "/admin/hr/jobs", label: "HR / Jobs", icon: Briefcase },
      { href: "/admin/subscription", label: "Subscription", icon: CreditCard },
      { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
      { href: "/admin/suggestions", label: "Suggestions", icon: Lightbulb },
      { href: "/admin/support", label: "Support", icon: HeadphonesIcon },
      { href: "/admin/csat", label: "CSAT", icon: SmilePlus },
      { href: "/admin/venue-applications", label: "Venue Apps", icon: ClipboardList },
      { href: "/admin/zones", label: "Zones", icon: MapPin },
      { href: "/admin/setup", label: "Setup", icon: Settings },
    ],
  },
  {
    title: "Fotiqo Agent",
    badge: "AI",
    items: [
      { href: "/admin/agent", label: "Fotiqo Agent", icon: Sparkles },
      { href: "/admin/ai-command", label: "AI Command", icon: Terminal },
    ],
  },
  {
    title: "Store",
    items: [
      { href: "/admin/store/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/store/products", label: "Products", icon: Package },
      { href: "/admin/store/labs", label: "Print Labs", icon: Truck },
      { href: "/admin/store/coupons", label: "Coupons", icon: Ticket },
      { href: "/admin/store/fulfillment", label: "Fulfillment", icon: Truck },
      { href: "/admin/store/gift-cards", label: "Gift Cards", icon: CreditCard },
    ],
  },
  {
    title: "Hardware",
    items: [
      { href: "/admin/cameras", label: "Cameras", icon: Camera },
      { href: "/admin/kiosks", label: "Kiosks", icon: LayoutDashboard },
      { href: "/admin/kiosk-setup", label: "Kiosk network", icon: Wifi },
      { href: "/admin/wifi-transfer", label: "Wi-Fi routing", icon: Wifi },
      { href: "/admin/photo-flow", label: "Photo flow", icon: Sparkles },
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
      { href: "/admin/reels", label: "Auto Reels", icon: Film },
      { href: "/admin/gamification", label: "Gamification", icon: Trophy },
    ],
  },
];

const ROLE_ALLOWED: Record<string, string[]> = {
  CEO: [
    "/admin/dashboard","/admin/upload","/admin/bookings","/admin/cameras","/admin/kiosks",
    "/admin/kiosk-setup","/admin/wifi-transfer","/admin/photo-flow","/kiosk/print-queue",
    "/admin/chat","/admin/staff","/admin/shifts","/admin/equipment","/admin/housing","/admin/academy","/admin/payroll",
    "/admin/commissions","/admin/pricing","/admin/cash","/admin/finance","/admin/sleeping-money","/admin/payouts","/admin/packages",
    "/admin/b2b","/admin/companies-manage","/admin/franchise","/admin/hotel-integration",
    "/admin/ai-insights","/admin/fraud-alerts","/admin/hr/jobs",
    "/admin/marketing","/admin/suggestions","/admin/support","/admin/csat","/admin/venue-applications","/admin/zones","/admin/setup",
    "/admin/blog","/admin/reviews","/admin/magic-elements","/admin/retouch","/admin/reels","/admin/gamification",
    "/admin/store/orders","/admin/store/products","/admin/store/labs","/admin/store/coupons","/admin/store/fulfillment","/admin/store/gift-cards",
    "/admin/subscription","/admin/agent","/admin/ai-command","/admin/email",
  ],
  OPERATIONS_MANAGER: [
    "/admin/dashboard","/admin/upload","/admin/bookings","/admin/cameras","/admin/kiosks",
    "/admin/kiosk-setup","/admin/wifi-transfer","/admin/photo-flow","/kiosk/print-queue",
    "/admin/email","/admin/chat","/admin/staff","/admin/shifts","/admin/equipment","/admin/housing","/admin/academy","/admin/payroll",
    "/admin/commissions","/admin/pricing","/admin/cash","/admin/finance","/admin/sleeping-money","/admin/payouts","/admin/packages",
    "/admin/b2b","/admin/hotel-integration","/admin/fraud-alerts","/admin/hr/jobs",
    "/admin/marketing","/admin/suggestions","/admin/support","/admin/csat","/admin/zones",
    "/admin/blog","/admin/reviews","/admin/magic-elements","/admin/retouch","/admin/reels","/admin/gamification",
    "/admin/store/orders","/admin/store/products","/admin/store/labs","/admin/store/coupons","/admin/store/fulfillment","/admin/store/gift-cards",
    "/admin/subscription","/admin/agent","/admin/ai-command",
  ],
  SUPERVISOR: [
    "/admin/dashboard","/admin/upload","/admin/bookings","/admin/chat","/admin/staff","/admin/equipment",
    "/admin/academy","/admin/blog","/admin/reviews",
  ],
  PHOTOGRAPHER: ["/admin/upload","/admin/bookings","/admin/chat"],
  SALES_STAFF: ["/admin/bookings","/admin/chat"],
  RECEPTIONIST: ["/admin/bookings","/admin/chat"],
  ACADEMY_TRAINEE: ["/admin/academy","/admin/chat"],
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
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/chat/unread", { cache: "no-store" });
        if (r.ok && alive) {
          const d = await r.json();
          setUnread(d.total ?? 0);
        }
      } catch {}
    };
    load();
    const t = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [pathname]);
  const allowed = ROLE_ALLOWED[user.role] || [];
  const visibleSections = SECTIONS
    .map((s) => ({ ...s, items: s.items.filter((i) => allowed.includes(i.href)) }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-brand-700 text-white transform transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-xl tracking-tight">Fotiqo</span>
        </div>
        <nav className="px-3 py-5 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin">
          {visibleSections.map((section) => (
            <div key={section.title} className="mb-6">
              <div className="px-3 text-[10px] font-medium uppercase tracking-[0.12em] text-white/50 mb-2 flex items-center gap-2">
                {section.title}
                {section.badge && (
                  <span className="text-[9px] font-semibold uppercase tracking-wider bg-coral-500/20 text-coral-300 px-1.5 py-0.5 rounded-full leading-none">
                    {section.badge}
                  </span>
                )}
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
                      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${
                        active
                          ? "bg-white/10 text-white font-medium"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r bg-coral-500" />}
                      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                      <span>{item.label}</span>
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
      <div className="lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-cream-100/80 backdrop-blur border-b border-cream-300/60">
          <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
            <button onClick={() => setOpen(!open)} className="btn-ghost lg:hidden -ml-2">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex-1" />
            <NotificationBell />
            <div className="flex items-center gap-3 pl-3 border-l border-cream-300/70">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-navy-900 leading-tight">{user.name}</div>
                <div className="text-[11px] text-navy-400 uppercase tracking-wider">{user.role}</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-medium text-sm">
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
