import Link from "next/link";
import { Camera, Layout, ShoppingBag, Users, BarChart3, Smartphone, Globe, Zap } from "lucide-react";

const sections = [
  {
    title: "Public Pages",
    icon: Globe,
    links: [
      { href: "/", label: "Homepage" },
      { href: "/about", label: "About" },
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/contact", label: "Contact" },
      { href: "/for/resort-photography", label: "For Resorts" },
      { href: "/for/water-parks", label: "For Water Parks" },
      { href: "/for/wedding-photographers", label: "For Weddings" },
      { href: "/for/freelance-photographers", label: "For Freelancers" },
    ],
  },
  {
    title: "Booking System",
    icon: Camera,
    links: [
      { href: "/book", label: "Browse Packages" },
      { href: "/book/family-beach-mini", label: "Family Beach Mini" },
      { href: "/book/sunset-romance", label: "Sunset Romance" },
      { href: "/book/kids-splash-session", label: "Kids Splash" },
      { href: "/book/corporate-event", label: "Corporate Event" },
      { href: "/book/solo-portrait", label: "Solo Portrait" },
    ],
  },
  {
    title: "Photographer Marketplace",
    icon: Users,
    links: [
      { href: "/find-photographer", label: "Search Photographers" },
      { href: "/find-photographer/sarah-chen", label: "Sarah Chen" },
      { href: "/find-photographer/marcus-dubois", label: "Marcus Dubois" },
      { href: "/find-photographer/elena-volkov", label: "Elena Volkov" },
      { href: "/find-photographer/omar-hassan", label: "Omar Hassan" },
      { href: "/p/sarah-chen", label: "Sarah's Website" },
      { href: "/p/marcus-dubois", label: "Marcus's Website" },
    ],
  },
  {
    title: "Shop & Products",
    icon: ShoppingBag,
    links: [
      { href: "/shop", label: "Photo Shop" },
      { href: "/shop/gift-cards", label: "Gift Cards" },
      { href: "/shop/single_photo", label: "Single Photo" },
      { href: "/shop/full_gallery", label: "Full Gallery" },
      { href: "/shop/pass_vip", label: "VIP Pass" },
    ],
  },
  {
    title: "Admin Dashboard",
    description: "Login: admin@fotiqo.local / password123",
    icon: BarChart3,
    links: [
      { href: "/login", label: "Login Page" },
      { href: "/admin/dashboard", label: "Analytics Dashboard" },
      { href: "/admin/upload", label: "Upload Hub" },
      { href: "/admin/bookings", label: "Bookings" },
      { href: "/admin/staff", label: "Staff Management" },
      { href: "/admin/finance", label: "Finance" },
      { href: "/admin/store", label: "Store" },
      { href: "/admin/chat", label: "Team Chat" },
      { href: "/admin/commissions", label: "Commissions" },
      { href: "/admin/packages", label: "Packages" },
    ],
  },
  {
    title: "Kiosk & POS",
    description: "PIN codes: 1111, 2222, 3333, 4444",
    icon: Smartphone,
    links: [
      { href: "/kiosk/sale-point", label: "Sale Point (POS)" },
      { href: "/kiosk/self-service", label: "Self-Service Kiosk" },
      { href: "/kiosk/tv-display", label: "TV Display" },
      { href: "/kiosk/gallery", label: "Kiosk Gallery" },
      { href: "/kiosk/sd-upload", label: "SD Upload Station" },
      { href: "/kiosk/print-queue", label: "Print Queue" },
    ],
  },
  {
    title: "Photographer Tools",
    description: "Login: photo1@fotiqo.local / password123",
    icon: Zap,
    links: [
      { href: "/my-dashboard", label: "My Dashboard" },
      { href: "/mobile-upload", label: "Mobile Upload" },
      { href: "/mobile-pos", label: "Mobile POS" },
      { href: "/camera/station", label: "Camera Station" },
    ],
  },
  {
    title: "SaaS Dashboard",
    description: "For independent photographers",
    icon: Layout,
    links: [
      { href: "/signup", label: "Sign Up" },
      { href: "/dashboard", label: "Dashboard Home" },
      { href: "/dashboard/website", label: "Website Builder" },
      { href: "/dashboard/galleries", label: "Galleries" },
      { href: "/dashboard/availability", label: "Availability" },
    ],
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-navy-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-12 w-12 rounded-xl" />
            <h1 className="text-4xl font-bold tracking-tight">Fotiqo Demo</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            The complete photography platform — 124 pages, 191 API routes, 23 modules.
            Explore every feature below.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <div className="bg-slate-700/50 rounded-lg px-4 py-2">
              <span className="text-slate-400">CEO Login:</span>{" "}
              <code className="text-teal-400">admin@fotiqo.local</code>
            </div>
            <div className="bg-slate-700/50 rounded-lg px-4 py-2">
              <span className="text-slate-400">Password:</span>{" "}
              <code className="text-teal-400">password123</code>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-5 w-5 text-teal-400" />
                  <h2 className="font-bold text-lg">{section.title}</h2>
                </div>
                {section.description && (
                  <p className="text-xs text-slate-400 mb-3">{section.description}</p>
                )}
                {!section.description && <div className="mb-3" />}
                <ul className="space-y-1.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-300 hover:text-teal-400 transition flex items-center gap-1.5"
                      >
                        <span className="text-slate-600">&#8250;</span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Credentials Table */}
        <div className="mt-12 bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">All Test Accounts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-white/10">
                  <th className="pb-2 pr-4">Role</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Password</th>
                  <th className="pb-2">Kiosk PIN</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {[
                  { role: "CEO", email: "admin@fotiqo.local", pin: "—" },
                  { role: "Operations Manager", email: "ops@fotiqo.local", pin: "—" },
                  { role: "Supervisor", email: "super@fotiqo.local", pin: "4444" },
                  { role: "Photographer 1", email: "photo1@fotiqo.local", pin: "1111" },
                  { role: "Photographer 2", email: "photo2@fotiqo.local", pin: "2222" },
                  { role: "Sales Staff", email: "sales@fotiqo.local", pin: "3333" },
                  { role: "Receptionist", email: "reception@fotiqo.local", pin: "—" },
                  { role: "Trainee", email: "trainee@fotiqo.local", pin: "—" },
                ].map((row) => (
                  <tr key={row.email} className="border-b border-white/5">
                    <td className="py-2 pr-4 font-medium">{row.role}</td>
                    <td className="py-2 pr-4"><code className="text-teal-400">{row.email}</code></td>
                    <td className="py-2 pr-4"><code className="text-orange-400">password123</code></td>
                    <td className="py-2"><code>{row.pin}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">
          Fotiqo v0.1.0 — 92 database models, 42 enums, 124 pages, 191 API routes
        </p>
      </div>
    </div>
  );
}
