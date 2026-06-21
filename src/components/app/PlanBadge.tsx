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
        ? "bg-violet-500/20 border border-violet-500/30 text-violet-300"
        : "bg-slate-800 border border-slate-700 text-slate-400",
    )}>
      {plan.name}
    </span>
  );
}
