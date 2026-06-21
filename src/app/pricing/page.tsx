"use client";

import { AppShell } from "@/components/app/AppShell";
import { usePlan } from "@/hooks/usePlan";
import { PLANS } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const FEATURES: Record<string, string[]> = {
  free: [
    "Hasta 3 documentos",
    "20 consultas/mes",
    "Solo PDF con texto",
    "Chat RAG con Groq",
  ],
  starter: [
    "Documentos ilimitados",
    "Consultas ilimitadas",
    "OCR: imágenes y PDFs escaneados",
    "Chat + búsqueda semántica",
    "Fallback extractivo",
  ],
  business: [
    "Todo de Starter",
    "Soporte prioritario",
    "Analytics avanzado",
    "Multi-workspace",
    "Exportación de reportes",
  ],
  enterprise: [
    "Todo de Business",
    "On-premise / self-hosted",
    "SLA personalizado",
    "Integración API dedicada",
    "Facturación corporativa",
  ],
};

export default function PricingPage() {
  const { planId, isLoaded } = usePlan();
  const [loading, setLoading] = useState<string | null>(null);

  const checkout = async (targetPlanId: string) => {
    setLoading(targetPlanId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlanId }),
      });
      const data = await res.json();
      if (res.status === 503) {
        toast.error("Stripe no está configurado. Agrega STRIPE_SECRET_KEY en .env.local");
        return;
      }
      if (res.status === 422) {
        toast.error(`Precio no configurado. Agrega STRIPE_PRICE_${targetPlanId.toUpperCase()} en .env.local`);
        return;
      }
      if (!res.ok || !data.url) {
        toast.error("Error al crear sesión de pago.");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("No se pudo conectar con Stripe.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-semibold">Planes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Elige el plan que mejor se adapte a tus necesidades. Cancela cuando quieras.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.values(PLANS).map((p) => {
            const isCurrent = isLoaded && p.id === planId;
            const isRecommended = p.id === "starter";
            const isLoadingThis = loading === p.id;

            return (
              <Card
                key={p.id}
                className={`relative flex flex-col ${
                  isRecommended
                    ? "border-violet-500 ring-2 ring-violet-500/20 shadow-lg shadow-violet-500/10"
                    : ""
                } ${isCurrent ? "border-emerald-500/50" : ""}`}
              >
                {isRecommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-violet-600 text-white px-3 shadow">Recomendado</Badge>
                  </div>
                )}

                <CardHeader className="pb-3 pt-6">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{p.name}</span>
                    {isCurrent && (
                      <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
                        Actual
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="mt-2">
                    {p.price === 0 ? (
                      <span className="text-3xl font-bold">Gratis</span>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold">${p.price}</span>
                        <span className="text-sm text-muted-foreground pb-0.5">/mes</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col space-y-4">
                  <ul className="flex-1 space-y-2">
                    {(FEATURES[p.id] ?? []).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {p.price === 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled
                    >
                      {isCurrent ? "Plan actual" : "Gratis para siempre"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className={`w-full ${isRecommended ? "bg-violet-600 hover:bg-violet-700" : ""}`}
                      disabled={isCurrent || isLoadingThis}
                      onClick={() => checkout(p.id)}
                    >
                      {isLoadingThis ? (
                        <><Loader2 className="size-3.5 mr-2 animate-spin" />Redirigiendo…</>
                      ) : isCurrent ? (
                        "Plan actual"
                      ) : (
                        <><Zap className="size-3.5 mr-1.5" />Elegir {p.name}</>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="rounded-lg border border-muted bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground space-y-1">
          <p>
            Modo test de Stripe — usa la tarjeta{" "}
            <span className="font-mono font-semibold text-foreground">4242 4242 4242 4242</span>,
            fecha futura y CVC cualquiera.
          </p>
          <p>No se realizan cargos reales. Los pagos son simulados.</p>
        </div>
      </div>
    </AppShell>
  );
}
