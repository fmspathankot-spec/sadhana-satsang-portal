"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, MapPin, Users, PenSquare, BarChart3, LayoutGrid } from "lucide-react";
import { clsx } from "clsx";

const links = [
  { name: "Home", href: "/", icon: Home },
  { name: "Sadhaks", href: "/sadhaks", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Places", href: "/places", icon: MapPin },
  { name: "Registration", href: "/registration", icon: PenSquare },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-slate-100/80 shadow-lg">
      <div className="mb-4 flex h-16 items-center justify-start rounded-lg bg-white/60 p-4 shadow-sm">
        <div className="flex items-center gap-3 text-primary-600">
          <LayoutGrid className="h-8 w-8" />
          <h1 className="text-xl font-bold">श्री राम शरणम्</h1>
        </div>
      </div>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-1">
        {links.map((link) => {
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex h-[48px] grow items-center justify-center gap-3 rounded-md p-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 hover:text-primary-600 md:flex-none md:justify-start md:p-2 md:px-3",
                {
                  "bg-primary-500 text-white shadow-md": pathname === link.href,
                }
              )}
            >
              <LinkIcon className="w-6" />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
