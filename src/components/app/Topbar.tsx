"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu, Brain } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { APP_NAV, APP_NAV_BOTTOM, PAGE_TITLES } from "./nav";
import { PlanBadge } from "./PlanBadge";

export function Topbar() {
  const pathname = usePathname();
  const key = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k));
  const title = key ? PAGE_TITLES[key] : "DocuMind AI";
  const allNav = [...APP_NAV, ...APP_NAV_BOTTOM];

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Abrir menú"
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 sm:max-w-none">
          <SheetTitle className="flex h-14 items-center gap-2 border-b px-4">
            <Brain className="size-5 text-violet-500" />
            DocuMind AI
          </SheetTitle>
          <nav className="flex flex-col gap-1 p-3">
            {allNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname.startsWith(item.href)
                      ? "bg-violet-500/10 text-violet-600"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <h1 className="font-heading text-base font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <PlanBadge />
        <UserButton />
      </div>
    </header>
  );
}
