"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useUser } from "@clerk/nextjs";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  HardDrive,
  Hash,
  ImageIcon,
  MessageSquare,
  ScanText,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDocuments } from "@/hooks/useDocuments";
import { useMetrics } from "@/hooks/useMetrics";
import { usePlan } from "@/hooks/usePlan";
import type { Document } from "@/types/document";

const ActivityChart = dynamic(
  () => import("@/components/app/ActivityChart").then((mod) => mod.ActivityChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full rounded-lg bg-zinc-800/60" />,
  },
);

type MetricTone = "gold" | "emerald" | "amber" | "orange";

const toneStyles: Record<MetricTone, { icon: string; bar: string; panel: string }> = {
  gold: {
    icon: "bg-violet-500/15 text-violet-400",
    bar: "bg-violet-500",
    panel: "hover:border-violet-500/30",
  },
  emerald: {
    icon: "bg-emerald-500/15 text-emerald-300",
    bar: "bg-emerald-400",
    panel: "hover:border-emerald-500/30",
  },
  amber: {
    icon: "bg-cyan-500/15 text-cyan-400",
    bar: "bg-cyan-500",
    panel: "hover:border-cyan-500/30",
  },
  orange: {
    icon: "bg-violet-500/15 text-violet-400",
    bar: "bg-violet-500",
    panel: "hover:border-violet-500/30",
  },
};

function SourceIcon({ type }: { type: Document["source_type"] }) {
  if (type === "pdf_text") return <FileText className="size-4 text-zinc-400" />;
  if (type === "pdf_ocr") return <ScanText className="size-4 text-cyan-400" />;
  return <ImageIcon className="size-4 text-emerald-300" />;
}

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  tone,
  loading,
  progress,
}: {
  title: string;
  value: string | number;
  helper: string;
  icon: React.ElementType;
  tone: MetricTone;
  loading: boolean;
  progress: number;
}) {
  const style = toneStyles[tone];

  return (
    <div
      className={cn(
        "app-panel rounded-lg p-4 shadow-sm transition-colors",
        style.panel,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {title}
          </p>
          <div className="mt-2">
            {loading ? (
              <Skeleton className="h-8 w-24 rounded-md bg-zinc-800" />
            ) : (
              <p className="truncate text-2xl font-bold tabular-nums text-white">
                {value}
              </p>
            )}
          </div>
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", style.icon)}>
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={cn("h-full rounded-full transition-all duration-500", style.bar)}
          style={{ width: `${Math.max(8, Math.min(100, progress))}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-zinc-500">{helper}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  description,
  tone,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  tone: MetricTone;
}) {
  const style = toneStyles[tone];

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-zinc-800/70 bg-zinc-950/35 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-800/60"
    >
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", style.icon)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-100">{label}</p>
        <p className="truncate text-xs text-zinc-500">{description}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-300" />
    </Link>
  );
}

function RecentDocuments({ docs, loading }: { docs: Document[]; loading: boolean }) {
  const recent = docs.slice(0, 5);

  return (
    <section className="app-panel rounded-lg">
      <div className="flex items-center justify-between border-b border-zinc-800/70 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Documentos recientes</h3>
          <p className="text-xs text-zinc-500">Ultimos archivos indexados</p>
        </div>
        <Link
          href="/documents"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          Ver todos <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg bg-zinc-800/70" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-zinc-800">
              <FileText className="size-5 text-zinc-500" />
            </div>
            <p className="mt-3 text-sm font-medium text-zinc-300">Aun no hay documentos</p>
            <Link href="/upload" className="mt-1 inline-flex text-xs font-medium text-violet-400 hover:text-violet-300">
              Subir el primero
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {recent.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-zinc-800/45"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-800/80">
                  <SourceIcon type={doc.source_type} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-100">{doc.filename}</p>
                  <p className="text-xs text-zinc-500">
                    {doc.pages} pags. · {doc.chunks} fragmentos
                  </p>
                </div>
                <span className="rounded-md border border-zinc-700/70 bg-zinc-800/60 px-2 py-1 text-[11px] text-zinc-400">
                  {new Date(doc.uploaded_at).toLocaleDateString("es-PA", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PlanPanel({
  planName,
  docsUsed,
  docsMax,
  planId,
}: {
  planName: string;
  docsUsed: number;
  docsMax: number | typeof Infinity;
  planId: string;
}) {
  const unlimited = docsMax === Infinity;
  const progress = unlimited ? 100 : Math.min(100, (docsUsed / docsMax) * 100);

  return (
    <section className="app-panel rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Plan activo
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">{planName}</h3>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
          <ShieldCheck className="size-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Capacidad de documentos</span>
          <span className="font-medium text-zinc-300">
            {unlimited ? `${docsUsed} / ilimitado` : `${docsUsed} / ${docsMax}`}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="app-panel-quiet rounded-lg p-3">
          <p className="text-xs text-zinc-500">OCR</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-zinc-100">
            {planId === "free" ? (
              <>
                <AlertCircle className="size-4 text-violet-400" />
                Limitado
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 text-emerald-300" />
                Activo
              </>
            )}
          </p>
        </div>
        <Link
          href="/pricing"
          className="app-panel-quiet rounded-lg p-3 transition-colors hover:border-violet-500/35 hover:bg-violet-500/10"
        >
          <p className="text-xs text-zinc-500">Mejorar</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-violet-300">
            Planes <ArrowRight className="size-4" />
          </p>
        </Link>
      </div>
    </section>
  );
}

export function MetricsDashboard() {
  const { user } = useUser();
  const { metrics, loading: metricsLoading, error } = useMetrics();
  const { documents, loading: docsLoading } = useDocuments();
  const { plan, planId } = usePlan();

  const docs = metrics?.documents ?? 0;
  const chunks = metrics?.chunks ?? 0;
  const queries = metrics?.queries ?? 0;
  const storage = metrics?.storage_mb ?? 0;
  const docsMax = plan.maxDocs;
  const docsProgress = docsMax === Infinity ? 100 : Math.min(100, (docs / docsMax) * 100);
  const docsLeft = docsMax === Infinity ? null : Math.max(0, docsMax - docs);
  const firstName = user?.firstName ?? user?.username ?? "equipo";

  return (
    <div className="space-y-5">
      <section className="app-panel overflow-hidden rounded-lg">
        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="relative border-b border-zinc-800/70 bg-[linear-gradient(135deg,rgba(139,92,246,0.10),transparent_38%),linear-gradient(90deg,rgba(16,185,129,0.05),transparent_58%)] p-6 lg:border-b-0 lg:border-r lg:p-7">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#8b5cf6,#10b981,transparent)]" />
            <div className="flex flex-wrap items-start justify-between gap-5 pt-1">
              <div>
                <div className="app-kicker inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium">
                  <Sparkles className="size-3.5" />
                  Centro operativo
                </div>
                <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white lg:text-4xl">
                  Hola, {firstName}. Tu base documental esta lista.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                  Supervisa documentos, consultas y actividad desde un solo panel de mando.
                </p>
              </div>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(139,92,246,0.16)] transition-colors hover:bg-violet-500"
              >
                <Bot className="size-4" />
                Preguntar ahora
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="app-panel-quiet rounded-lg p-3">
                <p className="text-xs text-zinc-500">Estado</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 className="size-4" />
                  Operativo
                </p>
              </div>
              <div className="app-panel-quiet rounded-lg p-3">
                <p className="text-xs text-zinc-500">Documentos libres</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {docsLeft === null ? "Ilimitados" : docsLeft}
                </p>
              </div>
              <div className="app-panel-quiet rounded-lg p-3">
                <p className="text-xs text-zinc-500">Respuesta</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-violet-300">
                  <Zap className="size-4" />
                  RAG con citas
                </p>
              </div>
            </div>
          </div>

          <PlanPanel planName={plan.name} docsUsed={docs} docsMax={docsMax} planId={planId} />
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle className="size-5 shrink-0 text-red-300" />
          <span>
            No se pudo conectar con el backend. Verifica FastAPI en{" "}
            <code className="font-mono text-xs text-red-100">localhost:8000</code>.
          </span>
        </div>
      )}

      {planId === "free" && docsLeft !== null && docsLeft <= 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-violet-500/25 bg-violet-500/10 px-4 py-3">
          <span className="text-sm text-violet-100">
            {docsLeft === 0
              ? "Llegaste al limite de documentos del plan Free."
              : `Te queda ${docsLeft} documento disponible en Free.`}
          </span>
          <Link
            href="/pricing"
            className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500"
          >
            Ver planes
          </Link>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Documentos"
          value={docs}
          helper={`${Math.round(docsProgress)}% de capacidad usada`}
          icon={FileText}
          tone="gold"
          loading={metricsLoading}
          progress={docsProgress}
        />
        <MetricCard
          title="Fragmentos"
          value={chunks}
          helper="Base semantica disponible"
          icon={Hash}
          tone="emerald"
          loading={metricsLoading}
          progress={Math.min(100, chunks / 8)}
        />
        <MetricCard
          title="Consultas"
          value={queries}
          helper="Preguntas procesadas"
          icon={MessageSquare}
          tone="orange"
          loading={metricsLoading}
          progress={Math.min(100, queries * 5)}
        />
        <MetricCard
          title="Almacenamiento"
          value={`${storage.toFixed(1)} MB`}
          helper="Archivos y vectores"
          icon={HardDrive}
          tone="amber"
          loading={metricsLoading}
          progress={Math.min(100, storage * 3)}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <div className="app-panel rounded-lg">
          <div className="flex items-center justify-between border-b border-zinc-800/70 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Actividad de conocimiento</h3>
                <p className="text-xs text-zinc-500">Consultas de los ultimos 7 dias</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            {metricsLoading ? (
              <Skeleton className="h-48 w-full rounded-lg bg-zinc-800/60" />
            ) : (metrics?.activity?.length ?? 0) === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/30">
                <TrendingUp className="size-6 text-zinc-600" />
                <p className="text-sm text-zinc-500">Sin actividad registrada aun.</p>
              </div>
            ) : (
              <ActivityChart activity={metrics?.activity ?? []} />
            )}
          </div>
        </div>

        <div className="app-panel rounded-lg">
          <div className="border-b border-zinc-800/70 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Acciones rapidas</h3>
            <p className="text-xs text-zinc-500">Atajos para continuar trabajando</p>
          </div>
          <div className="grid gap-2 p-3">
            <QuickAction
              href="/upload"
              icon={Upload}
              label="Subir documento"
              description="PDF, imagen o contrato"
              tone="gold"
            />
            <QuickAction
              href="/chat"
              icon={Bot}
              label="Abrir chat"
              description="Pregunta con fuentes"
              tone="orange"
            />
            <QuickAction
              href="/search"
              icon={Search}
              label="Busqueda semantica"
              description="Encuentra fragmentos"
              tone="emerald"
            />
            <QuickAction
              href="/documents"
              icon={FileText}
              label="Ver documentos"
              description="Audita tu base"
              tone="amber"
            />
          </div>
        </div>
      </section>

      <RecentDocuments docs={documents} loading={docsLoading} />
    </div>
  );
}
