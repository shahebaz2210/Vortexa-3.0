"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/fleet", label: "Fleet & Drivers", icon: "🚚" },
  { href: "/orders", label: "Orders & Cargo", icon: "📦" },
  { href: "/plans", label: "Route Plans", icon: "🗺️" },
  { href: "/plans/new", label: "Import Excel/CSV", icon: "📥" },
  { href: "/disruptions", label: "Disruptions & Approval", icon: "⚠️", badge: "2 Active" },
  { href: "/driver", label: "Driver Web Portal", icon: "📱" },
  { href: "/audit", label: "Audit Trail", icon: "🔒" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card/50 flex flex-col justify-between p-4 shrink-0 hidden md:flex">
      <div className="space-y-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-sm">
            ⚡
          </div>
          <div>
            <div className="font-black text-base tracking-tight text-foreground">
              Dispatch<span className="text-primary">X</span>
            </div>
            <div className="text-[10px] font-semibold text-muted tracking-wider uppercase">
              VORTEXA 3.0 Platform
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="border-t border-border pt-3 px-2 space-y-1">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Engine Status</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            OR-Tools Active
          </span>
        </div>
        <div className="text-[11px] text-muted font-mono truncate">
          v3.0.0-rc1 • 100% Web UI
        </div>
      </div>
    </aside>
  );
}
