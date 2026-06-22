"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { APP_NAV, APP_NAV_BOTTOM } from "@/components/app/nav";

const appRoutes = [...APP_NAV, ...APP_NAV_BOTTOM].map((item) => item.href);
const warmRoutes = [...appRoutes, "/pricing"];

export function AppShell({
  children,
  noPadding,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const compact = noPadding ?? pathname.startsWith("/chat");

  useEffect(() => {
    for (const href of warmRoutes) {
      if (href !== pathname) {
        router.prefetch(href);
      }
    }
  }, [pathname, router]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let cancelled = false;
    const prewarm = async () => {
      const routes = warmRoutes.filter((href) => href !== pathname);
      await new Promise((resolve) => window.setTimeout(resolve, 450));

      for (const href of routes) {
        if (cancelled) return;
        await fetch(href, {
          credentials: "same-origin",
          priority: "low",
        } as RequestInit).catch(() => undefined);
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
    };

    prewarm();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="app-workspace flex min-h-0 flex-1 flex-col">
        <Topbar />
        <main
          className={
            compact
              ? "flex min-h-0 flex-1 overflow-hidden"
              : "flex flex-1 flex-col overflow-y-auto"
          }
        >
          {compact ? (
            children
          ) : (
            <div className="mx-auto flex w-full max-w-[1480px] flex-col p-5 lg:p-8">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
