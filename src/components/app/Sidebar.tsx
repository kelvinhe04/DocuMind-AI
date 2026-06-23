"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_NAV, APP_NAV_BOTTOM, type NavItem } from "./nav";
import { PlanBadge } from "./PlanBadge";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-violet-500/10 text-white"
          : "text-zinc-400 hover:bg-zinc-800/55 hover:text-zinc-100",
      )}
    >
      <Icon className={cn("size-4", active ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-300")} />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-800/80 bg-[#0b0b0c] md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800/80 px-4">
        <div className="flex size-9 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
          <Brain className="size-5 text-violet-400" />
        </div>
        <div className="min-w-0">
          <span className="block truncate font-heading text-base font-semibold text-white">DocuMind</span>
          <p className="truncate text-[11px] text-zinc-500">Workspace documental</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {APP_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
        <div className="my-2 border-t border-zinc-800/70" />
        {APP_NAV_BOTTOM.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>
      <div className="m-3 rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
          <Sparkles className="size-3.5 text-violet-400" />
          Plan actual
        </div>
        <div className="mt-2">
          <PlanBadge />
        </div>
      </div>
    </aside>
  );
}
