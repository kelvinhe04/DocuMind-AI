import { AppShell } from "@/components/app/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold">Dashboard</h2>
        <p className="text-muted-foreground">
          Métricas, gráfica de actividad y documentos recientes — Fase 4.
        </p>
      </div>
    </AppShell>
  );
}
