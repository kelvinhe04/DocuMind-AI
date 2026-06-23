"use client";

import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";

export function PlanBadge() {
  const { planId, plan } = usePlan();
  const isPro = planId !== "free";
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      isPro
        ? "border border-violet-500/30 bg-violet-500/15 text-violet-300"
        : "border border-zinc-700 bg-zinc-800 text-zinc-400",
    )}>
      {plan.name}
    </span>
  );
}
