"use client";

import { useMemo, useState } from "react";
import {
  ExternalLink,
  Eye,
  FileText,
  ImageIcon,
  RefreshCw,
  ScanText,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDocuments } from "@/hooks/useDocuments";
import type { Document } from "@/types/document";

function SourceBadge({ type }: { type: Document["source_type"] }) {
  if (type === "pdf_text") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-300">
        <FileText className="size-3" />PDF
      </span>
    );
  }
  if (type === "pdf_ocr") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-200">
        <ScanText className="size-3" />PDF OCR
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-200">
      <ImageIcon className="size-3" />Imagen OCR
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isImage(filename: string) {
  return /\.(jpg|jpeg|png)$/i.test(filename);
}

function PreviewModal({ doc, onClose }: { doc: Document; onClose: () => void }) {
  const src = `/api/proxy/documents/${doc.id}/file/${encodeURIComponent(doc.filename)}`;
  const image = isImage(doc.filename);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 shadow-2xl">
        <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-4 py-3">
          <FileText className="size-4 shrink-0 text-amber-300" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-100">{doc.filename}</span>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <ExternalLink className="size-3.5" />
            Abrir
          </a>
          <button onClick={onClose} className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden bg-zinc-950">
          {image ? (
            <div className="flex h-full items-center justify-center p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={doc.filename} className="max-h-full max-w-full rounded-lg object-contain" />
            </div>
          ) : (
            <iframe src={src} title={doc.filename} className="h-full w-full border-0" />
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="app-panel-quiet rounded-lg p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-white">{value}</p>
    </div>
  );
}

export function DocumentList() {
  const { documents, loading, error, refresh } = useDocuments();
  const [filter, setFilter] = useState("");
  const [previewing, setPreviewing] = useState<Document | null>(null);

  const filtered = useMemo(
    () => documents.filter((doc) => doc.filename.toLowerCase().includes(filter.toLowerCase())),
    [documents, filter],
  );
  const ocrCount = documents.filter((doc) => doc.source_type !== "pdf_text").length;
  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunks, 0);
  const totalPages = documents.reduce((sum, doc) => sum + doc.pages, 0);

  return (
    <>
      <div className="space-y-5">
        <section className="app-panel overflow-hidden rounded-lg">
          <div className="border-b border-zinc-800/70 bg-[linear-gradient(135deg,rgba(245,158,11,0.10),transparent_40%)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="app-kicker inline-flex rounded-md px-2.5 py-1 text-xs font-medium">Biblioteca</div>
                <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white">Documentos</h2>
                <p className="mt-1 text-sm text-zinc-400">Controla los archivos indexados y su estado de procesamiento.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <RefreshCw className={cn("mr-2 size-3.5", loading && "animate-spin")} />
                Actualizar
              </Button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Stat label="Archivos" value={documents.length} />
              <Stat label="Paginas" value={totalPages} />
              <Stat label="Fragmentos" value={totalChunks} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/70 px-4 py-3">
            <div className="relative min-w-[240px] flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar archivo..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 py-2 pl-9 pr-4 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
              />
            </div>
            <span className="text-xs text-zinc-500">{ocrCount} con OCR</span>
          </div>

          {error && (
            <div className="m-4 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[1fr_120px_80px_90px_110px_130px_48px] items-center gap-4 border-b border-zinc-800/70 bg-zinc-950/25 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Archivo</span>
                <span className="text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Tipo</span>
                <span className="text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Pags.</span>
                <span className="text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Chunks</span>
                <span className="text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">OCR</span>
                <span className="text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Subido</span>
                <span />
              </div>

              <div className="divide-y divide-zinc-800/60">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-[1fr_120px_80px_90px_110px_130px_48px] items-center gap-4 px-4 py-3">
                      <Skeleton className="h-4 w-52 bg-zinc-800" />
                      <Skeleton className="mx-auto h-6 w-20 rounded-md bg-zinc-800" />
                      <Skeleton className="mx-auto h-4 w-8 bg-zinc-800" />
                      <Skeleton className="mx-auto h-4 w-10 bg-zinc-800" />
                      <Skeleton className="mx-auto h-4 w-12 bg-zinc-800" />
                      <Skeleton className="ml-auto h-4 w-24 bg-zinc-800" />
                      <Skeleton className="h-8 w-8 rounded-lg bg-zinc-800" />
                    </div>
                  ))
                ) : filtered.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-zinc-800">
                      <FileText className="size-5 text-zinc-500" />
                    </div>
                    <p className="mt-3 text-sm text-zinc-500">
                      {filter ? "Sin resultados para esa busqueda." : "No hay documentos cargados."}
                    </p>
                  </div>
                ) : (
                  filtered.map((doc) => (
                    <div
                      key={doc.id}
                      className="grid grid-cols-[1fr_120px_80px_90px_110px_130px_48px] items-center gap-4 px-4 py-3 transition-colors hover:bg-zinc-800/35"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                          <FileText className="size-4 text-zinc-400" />
                        </div>
                        <span className="truncate text-sm font-medium text-zinc-100">{doc.filename}</span>
                      </div>
                      <div className="flex justify-center"><SourceBadge type={doc.source_type} /></div>
                      <span className="text-center text-sm text-zinc-400">{doc.pages}</span>
                      <span className="text-center text-sm text-zinc-400">{doc.chunks}</span>
                      <span className="text-center text-sm text-zinc-400">
                        {doc.ocr_confidence != null ? (
                          <span className="text-emerald-300">{doc.ocr_confidence}%</span>
                        ) : (
                          <span className="text-zinc-600">N/A</span>
                        )}
                      </span>
                      <span className="text-right text-xs text-zinc-500">{formatDate(doc.uploaded_at)}</span>
                      <button
                        onClick={() => setPreviewing(doc)}
                        className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-amber-300"
                        title="Vista previa"
                      >
                        <Eye className="size-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {previewing && <PreviewModal doc={previewing} onClose={() => setPreviewing(null)} />}
    </>
  );
}
