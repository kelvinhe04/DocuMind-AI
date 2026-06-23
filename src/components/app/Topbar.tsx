"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Brain, Home, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { clerkDarkAppearance } from "@/lib/clerkAppearance";
import { cn } from "@/lib/utils";
import { APP_NAV, APP_NAV_BOTTOM, PAGE_TITLES } from "./nav";
import { PlanBadge } from "./PlanBadge";

export function Topbar() {
  const pathname = usePathname();
  const key = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k));
  const title = key ? PAGE_TITLES[key] : "DocuMind";
  const allNav = [...APP_NAV, ...APP_NAV_BOTTOM];

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-zinc-800/80 bg-[#0b0b0c]/90 px-4 backdrop-blur">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden"
              aria-label="Abrir menu"
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-zinc-800 bg-[#0b0b0c] p-0 text-zinc-100 sm:max-w-none">
          <SheetTitle className="flex h-16 items-center gap-3 border-b border-zinc-800 px-4 text-white">
            <div className="flex size-9 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
              <Brain className="size-5 text-violet-400" />
            </div>
            DocuMind
          </SheetTitle>
          <nav className="flex flex-col gap-1 p-3">
            {allNav.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-violet-500/10 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100",
                  )}
                >
                  <Icon className={cn("size-4", active ? "text-violet-400" : "text-zinc-500")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="min-w-0">
        <h1 className="truncate font-heading text-base font-semibold text-white">{title}</h1>
        <p className="hidden text-[11px] text-zinc-500 sm:block">Operacion documental</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/search"
          className="hidden size-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 transition-colors hover:border-violet-500/30 hover:text-violet-300 sm:flex"
          title="Buscar"
        >
          <Search className="size-4" />
        </Link>
        <PlanBadge />
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
          title="Ir a la landing"
        >
          <Home className="size-4" />
          <span className="hidden sm:block">Inicio</span>
        </Link>
        <UserButton appearance={clerkDarkAppearance} />
      </div>
    </header>
  );
}
