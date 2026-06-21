"use client";

import Link from "next/link";
import { FileText, Hash, MessageSquare, HardDrive, RefreshCw, Upload, Bot, Search, AlertCircle, ScanText, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useMetrics } from "@/hooks/useMetrics";
import { useDocuments } from "@/hooks/useDocuments";
import { usePlan } from "@/hooks/usePlan";
import type { Document } from "@/types/document";

function MetricCard({ title, value, icon: Icon, color, loading }: {
  title: string; value: string | number; icon: React.ElementType; color: string; loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`size-4 ${color}`} />
      </CardHeader>
      <CardContent>
        {loading
          ? <Skeleton className="h-8 w-20" />
          : <p className="text-3xl font-bold">{value}</p>
        }
      </CardContent>
    </Card>
  );
}

function SourceIcon({ type }: { type: Document["source_type"] }) {
  if (type === "pdf_text") return <FileText className="size-3.5 text-muted-foreground" />;
  if (type === "pdf_ocr") return <ScanText className="size-3.5 text-amber-500" />;
  return <ImageIcon className="size-3.5 text-emerald-500" />;
}

function RecentDocuments({ docs, loading }: { docs: Document[]; loading: boolean }) {
  const recent = docs.slice(0, 5);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Documentos recientes</CardTitle>
        <Link
          href="/documents"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-auto py-1 px-2 text-xs text-muted-foreground")}
        >
          Ver todos →
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <FileText className="size-8 mx-auto mb-2 opacity-30" />
            No hay documentos aún.{" "}
            <Link href="/upload" className="text-violet-500 hover:underline">Sube el primero</Link>
          </div>
        ) : (
          <div className="divide-y">
            {recent.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 py-2.5 text-sm">
                <SourceIcon type={doc.source_type} />
                <span className="flex-1 truncate font-medium">{doc.filename}</span>
                <Badge variant="outline" className="shrink-0 text-[10px] py-0">{doc.chunks} chunks</Badge>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(doc.uploaded_at).toLocaleDateString("es-PA", { day: "2-digit", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricsDashboard() {
  const { metrics, loading: mLoading, error, refresh } = useMetrics();
  const { documents, loading: dLoading } = useDocuments();
  const { plan, planId } = usePlan();

  const docsLeft = plan.maxDocs === Infinity ? null : plan.maxDocs - (metrics?.documents ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold">Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Vista general de tu espacio de trabajo</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={mLoading}>
          <RefreshCw className={`mr-2 size-4 ${mLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Backend error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>
            No se pudo conectar con el backend. Verifica que FastAPI esté corriendo en{" "}
            <code className="font-mono text-xs">localhost:8000</code>.
          </span>
        </div>
      )}

      {/* Free plan limit warning */}
      {planId === "free" && docsLeft !== null && docsLeft <= 1 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <span className="text-amber-700 dark:text-amber-400">
            {docsLeft === 0
              ? "Has alcanzado el límite de 3 documentos del plan Free."
              : `Te queda ${docsLeft} documento disponible en el plan Free.`}
          </span>
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10")}
          >
            Actualizar plan
          </Link>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Documentos" value={metrics?.documents ?? 0} icon={FileText} color="text-violet-500" loading={mLoading} />
        <MetricCard title="Fragmentos" value={metrics?.chunks ?? 0} icon={Hash} color="text-emerald-500" loading={mLoading} />
        <MetricCard title="Consultas" value={metrics?.queries ?? 0} icon={MessageSquare} color="text-blue-500" loading={mLoading} />
        <MetricCard
          title="Almacenamiento"
          value={`${metrics?.storage_mb?.toFixed(1) ?? "0"} MB`}
          icon={HardDrive}
          color="text-amber-500"
          loading={mLoading}
        />
      </div>

      {/* Activity chart + quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Actividad — últimos 7 días</CardTitle>
          </CardHeader>
          <CardContent>
            {mLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (metrics?.activity?.length ?? 0) === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                Sin actividad registrada aún.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={metrics?.activity ?? []}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="url(#grad)" strokeWidth={2} name="Consultas" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/upload" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2")}>
              <Upload className="size-4 text-violet-500" />Subir documento
            </Link>
            <Link href="/chat" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2")}>
              <Bot className="size-4 text-blue-500" />Abrir chat
            </Link>
            <Link href="/search" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2")}>
              <Search className="size-4 text-emerald-500" />Búsqueda semántica
            </Link>
            <Link href="/documents" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2")}>
              <FileText className="size-4 text-amber-500" />Ver documentos
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent documents */}
      <RecentDocuments docs={documents} loading={dLoading} />
    </div>
  );
}
