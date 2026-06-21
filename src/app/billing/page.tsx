"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { usePlan } from "@/hooks/usePlan";
import { PLANS } from "@/lib/plans";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard, Zap, CheckCircle2, XCircle, Loader2,
  FileText, MessageSquare, HardDrive, ArrowRight, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMetrics } from "@/hooks/useMetrics";
import { cn } from "@/lib/utils";

/* ── Usage bar ───────────────────────────────────────────────────────────── */
function UsageBar({ label, value, max, icon: Icon }: {
  label: string; value: number; max: number | typeof Infinity; icon: React.ElementType;
}) {
  const isUnlimited = max === Infinity;
  const pct = isUnlimited ? 0 : Math.min(100, (value / max) * 100);
  const isOver = !isUnlimited && value > max;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-slate-400">
          <Icon className="size-3.5" />
          {label}
        </span>
        <span className={cn("text-sm font-semibold tabular-nums", isOver ? "text-red-400" : "text-slate-200")}>
          {value}
          {!isUnlimited && <span className="text-slate-500 font-normal"> / {max}</span>}
          {isUnlimited && <span className="ml-1.5 text-xs font-normal text-slate-500">ilimitado</span>}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isOver ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-violet-500",
            )}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      )}
    </div>
  );
}

/* ── Stripe confirm handler ──────────────────────────────────────────────── */
function StripeConfirmHandler({
  onState,
  onPlan,
}: {
  onState: (s: "idle" | "loading" | "success" | "error") => void;
  onPlan: (p: string) => void;
}) {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const confirming = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const incomingPlan = searchParams.get("plan");
    const canceled = searchParams.get("canceled");

    if (canceled) { toast.error("Pago cancelado. No se realizó ningún cargo."); return; }
    if (!sessionId || !incomingPlan || confirming.current) return;
    confirming.current = true;
    onState("loading");
    onPlan(incomingPlan);

    fetch("/api/stripe/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, plan: incomingPlan }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (r.ok && data.ok) {
          await user?.reload();
          onState("success");
          toast.success(`¡Plan actualizado a ${incomingPlan}!`);
          window.history.replaceState({}, "", "/billing");
        } else {
          onState("error");
          toast.error(r.status === 402 ? "El pago no se completó." : "No se pudo verificar el pago.");
        }
      })
      .catch(() => { onState("error"); toast.error("Error de red al confirmar el pago."); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

/* ── Main billing content ────────────────────────────────────────────────── */
function BillingContent() {
  const { plan, planId, isLoaded } = usePlan();
  const { metrics } = useMetrics();
  const [confirmState, setConfirmState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newPlan, setNewPlan] = useState<string | null>(null);

  const isPro = planId !== "free";

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-white">Facturación</h2>
        <p className="mt-0.5 text-xs text-slate-500">Administra tu plan y uso</p>
      </div>

      <Suspense fallback={null}>
        <StripeConfirmHandler onState={setConfirmState} onPlan={setNewPlan} />
      </Suspense>

      {/* Confirmation banners */}
      {confirmState === "loading" && (
        <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm text-violet-300">
          <Loader2 className="size-4 animate-spin text-violet-400 shrink-0" />
          Verificando pago y actualizando plan…
        </div>
      )}
      {confirmState === "success" && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" />
          ¡Plan actualizado a <strong className="capitalize">{newPlan}</strong>! Ya puedes usar todas las funciones.
        </div>
      )}
      {confirmState === "error" && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          <XCircle className="size-4 shrink-0" />
          No pudimos confirmar el pago. Intenta de nuevo o contacta soporte.
        </div>
      )}

      {/* Current plan card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex size-9 items-center justify-center rounded-xl",
              isPro ? "bg-violet-500/20" : "bg-slate-800",
            )}>
              <CreditCard className={cn("size-4", isPro ? "text-violet-400" : "text-slate-500")} />
            </div>
            <h3 className="text-sm font-semibold text-white">Plan actual</h3>
          </div>
          {!isLoaded ? (
            <Skeleton className="h-6 w-16 bg-slate-800 rounded-full" />
          ) : (
            <span className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              isPro
                ? "bg-violet-500/20 border border-violet-500/30 text-violet-300"
                : "bg-slate-800 border border-slate-700 text-slate-400",
            )}>
              {plan.name}
            </span>
          )}
        </div>

        {/* Plan details */}
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-800/50 border border-slate-800 p-3">
              <p className="text-xs text-slate-500 mb-1">Precio</p>
              <p className="text-base font-bold text-white">
                {planId === "free" ? "Gratis" : `$${plan.price}/mes`}
              </p>
            </div>
            <div className="rounded-xl bg-slate-800/50 border border-slate-800 p-3">
              <p className="text-xs text-slate-500 mb-1">OCR de imágenes</p>
              <p className={cn("text-base font-bold", plan.ocr ? "text-emerald-400" : "text-slate-500")}>
                {plan.ocr ? "✓ Incluido" : "✗ No disponible"}
              </p>
            </div>
          </div>

          {/* Usage bars */}
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Uso actual</p>
            <UsageBar label="Documentos" value={metrics?.documents ?? 0} max={plan.maxDocs} icon={FileText} />
            <UsageBar label="Consultas este mes" value={metrics?.queries ?? 0} max={plan.queriesMonth} icon={MessageSquare} />
            <UsageBar
              label="Almacenamiento"
              value={parseFloat((metrics?.storage_mb ?? 0).toFixed(1))}
              max={Infinity}
              icon={HardDrive}
            />
          </div>

          {/* Upgrade CTA */}
          {!isPro && (
            <div className="relative overflow-hidden rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-cyan-500/5 p-4">
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between gap-4 relative">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                    <Zap className="size-4 text-violet-400" />
                  </div>
                  <span className="text-sm text-slate-300">
                    Actualiza para desbloquear OCR y documentos ilimitados
                  </span>
                </div>
                <Link
                  href="/pricing"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3.5 py-2 transition-colors"
                >
                  Ver planes <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment method (paid plans only) */}
      {isPro && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/80">
          <div className="flex items-center gap-3 border-b border-slate-800/60 px-5 py-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15">
              <CreditCard className="size-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Método de pago</h3>
          </div>
          <div className="p-5 space-y-1">
            <p className="text-sm text-slate-300">•••• •••• •••• 4242 — Visa (modo test)</p>
            <p className="text-xs text-slate-500">Próxima factura: 21 de julio de 2026</p>
          </div>
        </div>
      )}

      {/* Plans overview */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/80">
        <div className="flex items-center gap-3 border-b border-slate-800/60 px-5 py-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-slate-800">
            <Sparkles className="size-4 text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Planes disponibles</h3>
        </div>
        <div className="divide-y divide-slate-800/40 p-2">
          {Object.values(PLANS).map((p) => {
            const isCurrent = p.id === planId;
            return (
              <div
                key={p.id}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-3 transition-colors",
                  isCurrent ? "bg-violet-500/8" : "hover:bg-slate-800/40",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex size-7 items-center justify-center rounded-lg",
                    isCurrent ? "bg-emerald-500/15" : "bg-slate-800",
                  )}>
                    {isCurrent
                      ? <CheckCircle2 className="size-3.5 text-emerald-400" />
                      : <div className="size-1.5 rounded-full bg-slate-600" />
                    }
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    isCurrent ? "text-white" : "text-slate-400",
                  )}>
                    {p.name}
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      Activo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn("text-sm tabular-nums", isCurrent ? "font-semibold text-slate-200" : "text-slate-500")}>
                    {p.price === 0 ? "Gratis" : `$${p.price}/mes`}
                  </span>
                  {!isCurrent && (
                    <Link
                      href="/pricing"
                      className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
                    >
                      Cambiar <ArrowRight className="size-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <AppShell>
      <BillingContent />
    </AppShell>
  );
}
