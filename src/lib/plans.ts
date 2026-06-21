// Fuente única de verdad de planes y límites (gating Free vs Pago).
export const PLANS = {
  free: { id: "free", name: "Free", price: 0, maxDocs: 3, ocr: false, queriesMonth: 20 },
  starter: { id: "starter", name: "Starter", price: 49, maxDocs: Infinity, ocr: true, queriesMonth: Infinity },
  business: { id: "business", name: "Business", price: 199, maxDocs: Infinity, ocr: true, queriesMonth: Infinity },
  enterprise: { id: "enterprise", name: "Enterprise", price: 999, maxDocs: Infinity, ocr: true, queriesMonth: Infinity },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanId];

export const DEFAULT_PLAN: PlanId = "free";

export function getPlan(id: string | undefined | null): Plan {
  return PLANS[(id as PlanId) ?? DEFAULT_PLAN] ?? PLANS[DEFAULT_PLAN];
}
