"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "DASHBOARD" },
  { href: "/users", label: "USERS" },
  { href: "/images", label: "IMAGES" },
  { href: "/captions", label: "CAPTIONS" },
  { href: "/reports", label: "REPORTS" },
  { href: "/bug-reports", label: "BUG REPORTS" },
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2.5 rounded font-mono text-[0.68rem] tracking-widest transition-all border-l-2 ${
              isActive
                ? "bg-[rgba(0,212,255,0.08)] text-[#00d4ff] border-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                : "text-[rgba(0,212,255,0.35)] hover:text-[rgba(0,212,255,0.7)] hover:bg-[rgba(0,212,255,0.04)] border-transparent"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
