import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const links = [
    { href: "/dashboard/website", label: "Website Builder" },
    { href: "/dashboard/galleries", label: "Client Galleries" },
    { href: "/dashboard/inquiries", label: "Inquiries" },
    { href: "/admin/dashboard", label: "Admin Panel" },
  ];

  return (
    <div>
      {/* Side navigation for photographer dashboard */}
      <nav className="fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-slate-200 z-30 hidden lg:block">
        <div className="p-4 border-b border-slate-200">
          <Link href="/" className="text-lg font-bold text-slate-900">Pixelvo</Link>
          <p className="text-xs text-slate-500 mt-1">Photographer Studio</p>
        </div>
        <div className="p-3 space-y-1">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900">
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="lg:ml-56">
        {children}
      </div>
    </div>
  );
}
