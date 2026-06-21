"use client";

import { Badge } from "@/components/ui/badge";
import { usePlan } from "@/hooks/usePlan";

export function PlanBadge() {
  const { planId, plan } = usePlan();
  return (
    <Badge variant={planId === "free" ? "secondary" : "default"}>{plan.name}</Badge>
  );
}
