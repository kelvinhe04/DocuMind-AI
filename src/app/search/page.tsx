import { AppShell } from "@/components/app/AppShell";

export default function SearchPage() {
  return (
    <AppShell>
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold">Búsqueda semántica</h2>
        <p className="text-muted-foreground">Resultados con score y highlight — Fase 4.</p>
      </div>
    </AppShell>
  );
}
