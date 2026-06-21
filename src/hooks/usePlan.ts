"use client";

import { useUser } from "@clerk/nextjs";
import { DEFAULT_PLAN, getPlan, type PlanId } from "@/lib/plans";

export function usePlan() {
  const { user, isLoaded } = useUser();
  const planId = ((user?.publicMetadata?.plan as PlanId) || DEFAULT_PLAN) as PlanId;
  return { planId, plan: getPlan(planId), isLoaded };
}
