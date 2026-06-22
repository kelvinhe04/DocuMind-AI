"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileText,
  HardDrive,
  Loader2,
  MessageSquare,
  Receipt,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useMetrics } from "@/hooks/useMetrics";
import { usePlan } from "@/hooks/usePlan";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

function UsageBar({
  label,
  value,
  max,
  icon: Icon,
}: {
  label: string;
  value: number;
  max: number | typeof Infinity;
  icon: React.ElementType;
}) {
  const unlimited = max === Infinity;
  const pct = unlimited ? 0 : Math.min(100, (value / max) * 100);
  const over = !unlimited && value > max;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm text-zinc-400">
          <Icon className="size-3.5" />
          {label}
        </span>
        <span className={cn("text-sm font-semibold tabular-nums", over ? "text-red-300" : "text-zinc-100")}>
          {value}
          {!unlimited && <span className="text-zinc-500"> / {max}</span>}
          {unlimited && <span className="ml-1 text-xs text-zinc-500">ilimitado</span>}
        </span>
      </div>
      {!unlimited && (
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              over ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500",
            )}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function StripeConfirmHandler({
  onState,
  onPlan,
}: {
  onState: (state: "idle" | "loading" | "success" | "error") => void;
  onPlan: (plan: string) => void;
}) {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const confirming = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const incomingPlan = searchParams.get("plan");
    const canceled = searchParams.get("canceled");

    if (canceled) {
      toast.error("Pago cancelado. No se realizo ningun cargo.");
      return;
    }
    if (!sessionId || !incomingPlan || confirming.current) return;

    confirming.current = true;
    onState("loading");
    onPlan(incomingPlan);

    fetch("/api/stripe/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, plan: incomingPlan }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok && data.ok) {
          await user?.reload();
          onState("success");
          toast.success(`Plan actualizado a ${incomingPlan}.`);
          window.history.replaceState({}, "", "/billing");
        } else {
          onState("error");
          toast.error(response.status === 402 ? "El pago no se completo." : "No se pudo verificar el pago.");
        }
      })
      .catch(() => {
        onState("error");
        toast.error("Error de red al confirmar el pago.");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function BillingContent() {
  const { plan, planId, isLoaded } = usePlan();
  const { metrics } = useMetrics();
  const [confirmState, setConfirmState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newPlan, setNewPlan] = useState<string | null>(null);
  const isPro = planId !== "free";

  return (
    <div className="space-y-5">
      <section className="app-panel overflow-hidden rounded-lg">
        <div className="border-b border-zinc-800/70 bg-[linear-gradient(135deg,rgba(245,158,11,0.10),transparent_42%)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="app-kicker inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium">
                <Receipt className="size-3.5" />
                Cuenta
              </div>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white">Facturacion</h2>
              <p className="mt-1 text-sm text-zinc-400">Administra tu plan, consumo y estado de pago.</p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-200"
            >
              Ver planes <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <Suspense fallback={null}>
          <StripeConfirmHandler onState={setConfirmState} onPlan={setNewPlan} />
        </Suspense>

        <div className="space-y-3 p-4">
          {confirmState === "loading" && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100">
              <Loader2 className="size-4 shrink-0 animate-spin text-amber-300" />
              Verificando pago y actualizando plan...
            </div>
          )}
          {confirmState === "success" && (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">
              <CheckCircle2 className="size-4 shrink-0" />
              Plan actualizado a <strong className="capitalize">{newPlan}</strong>.
            </div>
          )}
          {confirmState === "error" && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
              <XCircle className="size-4 shrink-0" />
              No pudimos confirmar el pago. Intenta de nuevo o contacta soporte.
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <section className="app-panel rounded-lg">
          <div className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                isPro ? "bg-amber-500/15 text-amber-300" : "bg-zinc-800 text-zinc-500",
              )}>
                <CreditCard className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Plan actual</h3>
                <p className="text-xs text-zinc-500">Capacidad y beneficios activos</p>
              </div>
            </div>
            {!isLoaded ? (
              <Skeleton className="h-6 w-16 rounded-md bg-zinc-800" />
            ) : (
              <span className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold",
                isPro ? "border border-amber-500/30 bg-amber-500/10 text-amber-200" : "border border-zinc-700 bg-zinc-800 text-zinc-400",
              )}>
                {plan.name}
              </span>
            )}
          </div>

          <div className="space-y-5 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="app-panel-quiet rounded-lg p-3">
                <p className="text-xs text-zinc-500">Precio</p>
                <p className="mt-1 text-xl font-bold text-white">{planId === "free" ? "Gratis" : `$${plan.price}/mes`}</p>
              </div>
              <div className="app-panel-quiet rounded-lg p-3">
                <p className="text-xs text-zinc-500">OCR</p>
                <p className={cn("mt-1 flex items-center gap-2 text-xl font-bold", plan.ocr ? "text-emerald-300" : "text-zinc-500")}>
                  {plan.ocr ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
                  {plan.ocr ? "Incluido" : "No disponible"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Uso actual</p>
              <UsageBar label="Documentos" value={metrics?.documents ?? 0} max={plan.maxDocs} icon={FileText} />
              <UsageBar label="Consultas este mes" value={metrics?.queries ?? 0} max={plan.queriesMonth} icon={MessageSquare} />
              <UsageBar
                label="Almacenamiento"
                value={parseFloat((metrics?.storage_mb ?? 0).toFixed(1))}
                max={Infinity}
                icon={HardDrive}
              />
            </div>

            {!isPro && (
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-200">
                      <Sparkles className="size-4" />
                    </div>
                    <p className="text-sm leading-6 text-zinc-300">
                      Actualiza para ampliar capacidad, OCR y consultas.
                    </p>
                  </div>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-3 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-200"
                  >
                    Mejorar <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="app-panel rounded-lg">
          <div className="flex items-center gap-3 border-b border-zinc-800/70 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
              <ShieldCheck className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Planes disponibles</h3>
          </div>
          <div className="divide-y divide-zinc-800/60 p-2">
            {Object.values(PLANS).map((item) => {
              const current = item.id === planId;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-3 transition-colors",
                    current ? "bg-amber-500/10" : "hover:bg-zinc-800/40",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex size-7 items-center justify-center rounded-lg",
                      current ? "bg-emerald-500/15" : "bg-zinc-800",
                    )}>
                      {current ? <CheckCircle2 className="size-4 text-emerald-300" /> : <div className="size-2 rounded-full bg-zinc-700" />}
                    </div>
                    <span className={cn("text-sm", current ? "font-semibold text-white" : "text-zinc-400")}>{item.name}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{item.price === 0 ? "Gratis" : `$${item.price}/mes`}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {isPro && (
        <section className="app-panel rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
              <CreditCard className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Metodo de pago</h3>
              <p className="text-sm text-zinc-300">**** **** **** 4242 - Visa (modo test)</p>
              <p className="text-xs text-zinc-500">Proxima factura: 21 de julio de 2026</p>
            </div>
          </div>
        </section>
      )}
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
