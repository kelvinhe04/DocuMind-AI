import { AppShell } from "@/components/app/AppShell";

export default function UploadPage() {
  return (
    <AppShell>
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold">Subir documento</h2>
        <p className="text-muted-foreground">Dropzone PDF/JPG/PNG con progreso — Fase 4.</p>
      </div>
    </AppShell>
  );
}
