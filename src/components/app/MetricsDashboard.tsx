"use client";

import Link from "next/link";
import {
  FileText, Hash, MessageSquare, HardDrive,
  Upload, Bot, Search, AlertCircle, ScanText, ImageIcon,
  ArrowRight, TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useMetrics } from "@/hooks/useMetrics";
import { useDocuments } from "@/hooks/useDocuments";
import { usePlan } from "@/hooks/usePlan";
import type { Document } from "@/types/document";

/* ── Metric card ─────────────────────────────────────────────────────────── */
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;       // tailwind bg class for icon bg
  iconColor: string;    // tailwind text class for icon
  glow: string;         // tailwind shadow/glow class
  loading: boolean;
}

function MetricCard({ title, value, icon: Icon, accent, iconColor, glow, loading }: MetricCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/80 p-5 transition-all duration-200 hover:border-slate-700",
      glow,
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="mt-2">
            {loading
              ? <Skeleton className="h-9 w-24 bg-slate-800" />
              : <p className="text-3xl font-bold text-white">{value}</p>
            }
          </div>
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-xl", accent)}>
          <Icon className={cn("size-5", iconColor)} />
        </div>
      </div>
      {/* subtle corner glow */}
      <div className={cn("absolute -bottom-4 -right-4 size-20 rounded-full blur-2xl opacity-20", accent)} />
    </div>
  );
}

/* ── Source icon ─────────────────────────────────────────────────────────── */
function SourceIcon({ type }: { type: Document["source_type"] }) {
  if (type === "pdf_text") return <FileText className="size-3.5 text-slate-500" />;
  if (type === "pdf_ocr") return <ScanText className="size-3.5 text-amber-400" />;
  return <ImageIcon className="size-3.5 text-emerald-400" />;
}

/* ── Recent documents ────────────────────────────────────────────────────── */
function RecentDocuments({ docs, loading }: { docs: Document[]; loading: boolean }) {
  const recent = docs.slice(0, 5);
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/80">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
        <h3 className="text-sm font-semibold text-white">Documentos recientes</h3>
        <Link
          href="/documents"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-400 transition-colors"
        >
          Ver todos <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="p-2">
        {loading ? (
          <div className="space-y-1 p-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-slate-800/60 rounded-xl" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-slate-800">
              <FileText className="size-5 text-slate-600" />
            </div>
            <p className="text-sm text-slate-500">No hay documentos aún.</p>
            <Link href="/upload" className="mt-1 inline-block text-xs text-violet-400 hover:text-violet-300">
              Sube el primero →
            </Link>
          </div>
        ) : (
          <div className="space-y-0.5">
            {recent.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-800/50"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                  <SourceIcon type={doc.source_type} />
                </div>
                <span className="flex-1 truncate text-sm font-medium text-slate-200">{doc.filename}</span>
                <span className="shrink-0 rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-400">
                  {doc.chunks} chunks
                </span>
                <span className="shrink-0 text-xs text-slate-600">
                  {new Date(doc.uploaded_at).toLocaleDateString("es-PA", { day: "2-digit", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Quick action button ─────────────────────────────────────────────────── */
function QuickAction({ href, icon: Icon, label, iconBg, iconColor }: {
  href: string; icon: React.ElementType; label: string; iconBg: string; iconColor: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-800/40 px-4 py-3 transition-all hover:border-slate-700 hover:bg-slate-800/80"
    >
      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors", iconBg)}>
        <Icon className={cn("size-4", iconColor)} />
      </div>
      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
      <ArrowRight className="ml-auto size-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
    </Link>
  );
}

/* ── Main dashboard ──────────────────────────────────────────────────────── */
export function MetricsDashboard() {
  const { metrics, loading: mLoading, error } = useMetrics();
  const { documents, loading: dLoading } = useDocuments();
  const { plan, planId } = usePlan();

  const docsLeft = plan.maxDocs === Infinity ? null : plan.maxDocs - (metrics?.documents ?? 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Dashboard</h2>
          <p className="mt-0.5 text-xs text-slate-500">Vista general de tu espacio de trabajo</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
            <AlertCircle className="size-4 text-red-400" />
          </div>
          <span className="text-red-300">
            No se pudo conectar con el backend. Verifica que FastAPI esté corriendo en{" "}
            <code className="font-mono text-xs text-red-400">localhost:8000</code>.
          </span>
        </div>
      )}

      {/* Plan limit warning */}
      {planId === "free" && docsLeft !== null && docsLeft <= 1 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
              <AlertCircle className="size-4 text-amber-400" />
            </div>
            <span className="text-sm text-amber-300">
              {docsLeft === 0
                ? "Has alcanzado el límite de 3 documentos del plan Free."
                : `Te queda ${docsLeft} documento disponible en el plan Free.`}
            </span>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            Actualizar plan
          </Link>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Documentos"
          value={metrics?.documents ?? 0}
          icon={FileText}
          accent="bg-violet-500/15"
          iconColor="text-violet-400"
          glow="hover:shadow-[0_0_24px_rgba(139,92,246,0.08)]"
          loading={mLoading}
        />
        <MetricCard
          title="Fragmentos"
          value={metrics?.chunks ?? 0}
          icon={Hash}
          accent="bg-emerald-500/15"
          iconColor="text-emerald-400"
          glow="hover:shadow-[0_0_24px_rgba(16,185,129,0.08)]"
          loading={mLoading}
        />
        <MetricCard
          title="Consultas"
          value={metrics?.queries ?? 0}
          icon={MessageSquare}
          accent="bg-blue-500/15"
          iconColor="text-blue-400"
          glow="hover:shadow-[0_0_24px_rgba(59,130,246,0.08)]"
          loading={mLoading}
        />
        <MetricCard
          title="Almacenamiento"
          value={`${metrics?.storage_mb?.toFixed(1) ?? "0"} MB`}
          icon={HardDrive}
          accent="bg-amber-500/15"
          iconColor="text-amber-400"
          glow="hover:shadow-[0_0_24px_rgba(245,158,11,0.08)]"
          loading={mLoading}
        />
      </div>

      {/* Activity chart + quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Chart */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/80 lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-violet-500/15">
                <TrendingUp className="size-3.5 text-violet-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Actividad — últimos 7 días</h3>
            </div>
          </div>
          <div className="p-5">
            {mLoading ? (
              <Skeleton className="h-48 w-full bg-slate-800/60 rounded-xl" />
            ) : (metrics?.activity?.length ?? 0) === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-800">
                  <TrendingUp className="size-5 text-slate-600" />
                </div>
                <p className="text-sm text-slate-500">Sin actividad registrada aún.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={metrics?.activity ?? []}>
                  <defs>
                    <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      fontSize: 12,
                      color: "#e2e8f0",
                    }}
                    cursor={{ stroke: "rgba(139,92,246,0.3)", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    fill="url(#violetGrad)"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "#a78bfa", strokeWidth: 0 }}
                    name="Consultas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/80">
          <div className="px-5 py-4 border-b border-slate-800/60">
            <h3 className="text-sm font-semibold text-white">Acciones rápidas</h3>
          </div>
          <div className="space-y-1.5 p-3">
            <QuickAction href="/upload"    icon={Upload}   label="Subir documento"   iconBg="bg-violet-500/15" iconColor="text-violet-400" />
            <QuickAction href="/chat"      icon={Bot}      label="Abrir chat"         iconBg="bg-blue-500/15"   iconColor="text-blue-400"   />
            <QuickAction href="/search"    icon={Search}   label="Búsqueda semántica" iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
            <QuickAction href="/documents" icon={FileText} label="Ver documentos"    iconBg="bg-amber-500/15"  iconColor="text-amber-400"  />
          </div>
        </div>
      </div>

      {/* Recent documents */}
      <RecentDocuments docs={documents} loading={dLoading} />
    </div>
  );
}
