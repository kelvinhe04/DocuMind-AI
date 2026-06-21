"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { usePlan } from "@/hooks/usePlan";
import { PLANS } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard, Zap, CheckCircle2, XCircle, Loader2, FileText, MessageSquare, HardDrive,
} from "lucide-react";
import Link from "next/link";
import { useMetrics } from "@/hooks/useMetrics";

function UsageBar({ label, value, max, icon: Icon }: {
  label: string; value: number; max: number | typeof Infinity; icon: React.ElementType;
}) {
  const pct = max === Infinity ? 0 : Math.min(100, (value / max) * 100);
  const isUnlimited = max === Infinity;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground"><Icon className="size-3.5" />{label}</span>
        <span className="font-medium">
          {value}{isUnlimited ? "" : ` / ${max}`}
          {isUnlimited && <span className="text-xs text-muted-foreground ml-1">ilimitado</span>}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-violet-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Isolated component that reads search params (must be inside Suspense)
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

    if (canceled) {
      toast.error("Pago cancelado. No se realizó ningún cargo.");
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
      .then(async (r) => {
        const data = await r.json();
        if (r.ok && data.ok) {
          await user?.reload();
          onState("success");
          toast.success(`¡Plan actualizado a ${incomingPlan}!`);
          window.history.replaceState({}, "", "/billing");
        } else {
          onState("error");
          const msg = r.status === 402 ? "El pago no se completó." : "No se pudo verificar el pago.";
          toast.error(msg);
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

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-heading text-2xl font-semibold">Facturación</h2>

      {/* Stripe confirm handler — reads useSearchParams, must be inside Suspense */}
      <Suspense fallback={null}>
        <StripeConfirmHandler onState={setConfirmState} onPlan={setNewPlan} />
      </Suspense>

      {/* Confirmation banner */}
      {confirmState === "loading" && (
        <div className="flex items-center gap-3 rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 text-sm">
          <Loader2 className="size-4 animate-spin text-violet-500" />
          Verificando pago y actualizando plan…
        </div>
      )}
      {confirmState === "success" && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          ¡Plan actualizado a <strong className="capitalize">{newPlan}</strong>! Ya puedes usar todas las funciones.
        </div>
      )}
      {confirmState === "error" && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <XCircle className="size-4" />
          No pudimos confirmar el pago. Intenta de nuevo o contacta soporte.
        </div>
      )}

      {/* Plan card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Plan actual</CardTitle>
          {!isLoaded ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <Badge className="bg-violet-500/20 text-violet-700 dark:text-violet-400 capitalize">
              {plan.name}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Precio</p>
              <p className="font-semibold">{planId === "free" ? "Gratis" : `$${plan.price}/mes`}</p>
            </div>
            <div>
              <p className="text-muted-foreground">OCR de imágenes</p>
              <p className="font-semibold">{plan.ocr ? "✓ Incluido" : "✗ No disponible"}</p>
            </div>
          </div>

          <div className="space-y-3 border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Uso actual</p>
            <UsageBar label="Documentos" value={metrics?.documents ?? 0} max={plan.maxDocs} icon={FileText} />
            <UsageBar label="Consultas este mes" value={metrics?.queries ?? 0} max={plan.queriesMonth} icon={MessageSquare} />
            <UsageBar
              label="Almacenamiento"
              value={parseFloat((metrics?.storage_mb ?? 0).toFixed(1))}
              max={Infinity}
              icon={HardDrive}
            />
          </div>

          {planId === "free" && (
            <div className="rounded-md border border-violet-500/30 bg-violet-500/5 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="size-4 text-violet-500 shrink-0" />
                <span>Actualiza para desbloquear OCR y documentos ilimitados</span>
              </div>
              <Link
                href="/pricing"
                className="shrink-0 inline-flex items-center justify-center rounded-md bg-violet-600 hover:bg-violet-700 text-white text-sm px-3 py-1.5 font-medium transition-colors"
              >
                Ver planes
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment method (only for paid plans) */}
      {planId !== "free" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="size-4" />
              Método de pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>•••• •••• •••• 4242 — Visa (modo test)</p>
            <p className="text-xs">Próxima factura: 21 de julio de 2026</p>
          </CardContent>
        </Card>
      )}

      {/* All plans summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Planes disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {Object.values(PLANS).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-2">
                  {p.id === planId && <CheckCircle2 className="size-4 text-emerald-500" />}
                  <span className={p.id === planId ? "font-semibold" : "text-muted-foreground"}>{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {p.price === 0 ? "Gratis" : `$${p.price}/mes`}
                  </span>
                  {p.id !== planId && (
                    <Link href="/pricing" className="text-violet-500 hover:underline text-xs">
                      Cambiar →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
