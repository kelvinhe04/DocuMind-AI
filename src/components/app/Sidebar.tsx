"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain } from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_NAV, APP_NAV_BOTTOM, type NavItem } from "./nav";
import { PlanBadge } from "./PlanBadge";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-violet-500/15 text-violet-300 shadow-[0_0_0_1px_rgba(139,92,246,0.2)]"
          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
      )}
    >
      <Icon className="size-4" />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800/60 bg-slate-900/95 md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-slate-800/60 px-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-violet-600/20">
          <Brain className="size-4 text-violet-400" />
        </div>
        <span className="font-heading text-base font-semibold text-white">DocuMind AI</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {APP_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
        <div className="my-2 border-t border-slate-800/60" />
        {APP_NAV_BOTTOM.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>
      <div className="flex items-center justify-between border-t border-slate-800/60 px-4 py-3 text-sm text-slate-500">
        <span>Plan actual</span>
        <PlanBadge />
      </div>
    </aside>
  );
}
