"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#050505]/80 backdrop-blur-xl border-r border-white/5 flex flex-col fixed left-0 top-0 z-40 shadow-2xl">
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
          <Image
            src="/assets/Loggo_Brand-removebg-preview.png"
            alt="Yalla Logo"
            width={120}
            height={60}
            className="cursor-pointer drop-shadow-2xl"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-2 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-6 py-3.5 rounded-r-2xl text-xs font-sans uppercase tracking-[0.2em] transition-all duration-300 group relative",
                isActive 
                  ? "bg-gradient-to-r from-primary/20 via-primary/5 to-transparent text-white font-medium" 
                  : "text-silver hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md shadow-[0_0_10px_rgba(230,0,0,0.5)]"></div>
              )}
              <item.icon size={18} className={cn("transition-transform duration-300", !isActive && "group-hover:scale-110", isActive && "text-primary drop-shadow-[0_0_8px_rgba(230,0,0,0.8)]")} />
              <span className={cn("transition-transform duration-300 mt-0.5", !isActive && "group-hover:translate-x-1")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent">
        <button 
          onClick={async () => {
            await import("@/lib/auth-client").then(m => m.signOut());
            window.location.href = "/admin/login";
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-xs font-sans uppercase tracking-[0.2em] text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="mt-0.5">Logout</span>
        </button>
      </div>
    </aside>
  );
}

