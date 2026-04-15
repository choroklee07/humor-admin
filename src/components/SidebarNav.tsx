"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navSections = [
  {
    label: "CONTENT",
    items: [
      { href: "/", label: "DASHBOARD" },
      { href: "/users", label: "USERS" },
      { href: "/images", label: "IMAGES" },
      { href: "/captions", label: "CAPTIONS" },
      { href: "/caption-ratings", label: "STATISTICS" },
      { href: "/humor", label: "HUMOR" },
      { href: "/terms", label: "TERMS" },
      { href: "/llm", label: "LLM" },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { href: "/allowed-domains", label: "ACCESS CONTROL" },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0 px-2">
      {navSections.map((section) => (
        <div key={section.label} className="mb-2">
          {section.items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded font-mono text-[0.68rem] tracking-widest transition-all border-l-2 ${
                  isActive
                    ? "bg-active cyber-text border-[var(--cyber-cyan)] shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                    : "t-inactive hover-t-active hover-bg-active border-transparent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
