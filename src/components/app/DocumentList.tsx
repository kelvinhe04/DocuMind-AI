"use client";

import { useState } from "react";
import { FileText, ImageIcon, ScanText, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDocuments } from "@/hooks/useDocuments";
import type { Document } from "@/types/document";

function SourceBadge({ type }: { type: Document["source_type"] }) {
  if (type === "pdf_text") return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
      <FileText className="size-3" />PDF
    </span>
  );
  if (type === "pdf_ocr") return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
      <ScanText className="size-3" />PDF OCR
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
      <ImageIcon className="size-3" />Imagen OCR
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PA", { day: "2-digit", month: "short", year: "numeric" });
}

export function DocumentList() {
  const { documents, loading, error, refresh } = useDocuments();
  const [filter, setFilter] = useState("");

  const filtered = documents.filter((d) =>
    d.filename.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Documentos</h2>
          <p className="mt-0.5 text-xs text-slate-500">{documents.length} documentos indexados</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <RefreshCw className={cn("mr-2 size-3.5", loading && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {/* Search input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por nombre…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/80 overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 border-b border-slate-800/60 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Archivo</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 w-24 text-center">Tipo</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 w-16 text-center">Págs.</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 w-20 text-center">Chunks</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 w-24 text-center">Conf. OCR</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 w-28 text-right">Subido</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-800/40">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-48 bg-slate-800" />
                <Skeleton className="h-5 w-24 bg-slate-800 rounded-full" />
                <Skeleton className="h-4 w-8 bg-slate-800 mx-auto" />
                <Skeleton className="h-4 w-10 bg-slate-800 mx-auto" />
                <Skeleton className="h-4 w-12 bg-slate-800 mx-auto" />
                <Skeleton className="h-4 w-24 bg-slate-800 ml-auto" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-slate-800">
                <FileText className="size-5 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500">
                {filter ? "Sin resultados para esa búsqueda." : "No hay documentos cargados aún."}
              </p>
            </div>
          ) : (
            filtered.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-800/30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                    <FileText className="size-3.5 text-slate-500" />
                  </div>
                  <span className="truncate text-sm font-medium text-slate-200">{doc.filename}</span>
                </div>
                <div className="w-24 flex justify-center">
                  <SourceBadge type={doc.source_type} />
                </div>
                <span className="w-16 text-center text-sm text-slate-400">{doc.pages}</span>
                <span className="w-20 text-center text-sm text-slate-400">{doc.chunks}</span>
                <span className="w-24 text-center text-sm text-slate-400">
                  {doc.ocr_confidence != null
                    ? <span className="text-emerald-400">{doc.ocr_confidence}%</span>
                    : <span className="text-slate-600">—</span>
                  }
                </span>
                <span className="w-28 text-right text-xs text-slate-500">{formatDate(doc.uploaded_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
