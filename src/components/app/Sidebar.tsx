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
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Brain className="size-6 text-violet-500" />
        <span className="font-heading text-lg font-semibold">DocuMind AI</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {APP_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
        <div className="my-2 border-t" />
        {APP_NAV_BOTTOM.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>
      <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
        <span>Plan actual</span>
        <PlanBadge />
      </div>
    </aside>
  );
}
