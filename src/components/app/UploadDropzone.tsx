"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, CheckCircle2, XCircle, Loader2, FileText, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UpgradeDialog } from "./UpgradeDialog";
import { cn } from "@/lib/utils";
import type { UploadResult } from "@/types/document";

function AnimatedProgressBar({ active, done }: { active: boolean; done: boolean }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const remaining = 92 - prev;
          if (remaining <= 0.1) return 92;
          return prev + remaining * 0.07;
        });
      }, 40);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  useEffect(() => {
    if (done) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
    }
  }, [done]);

  return (
    <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full relative overflow-hidden transition-[width] duration-500 ease-out",
          done ? "bg-emerald-500" : "bg-violet-500",
        )}
        style={{ width: `${progress}%` }}
      >
        {!done && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        )}
      </div>
    </div>
  );
}

type Step = "idle" | "extracting" | "embedding" | "indexing" | "done" | "error";

const STEP_LABELS: Record<Step, string> = {
  idle: "En cola…",
  extracting: "Extrayendo texto…",
  embedding: "Generando embeddings…",
  indexing: "Indexando en ChromaDB…",
  done: "¡Listo!",
  error: "Error al procesar",
};


type FileEntry = {
  id: string;
  file: File;
  step: Step;
  result: UploadResult | null;
  error?: string;
};

interface Props {
  onSuccess?: () => void;
}

export function UploadDropzone({ onSuccess }: Props) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>();
  const isStartingRef = useRef(false);

  const updateEntry = useCallback((id: string, patch: Partial<FileEntry>) =>
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e)), []);

  const removeEntry = (id: string) =>
    setEntries(prev => prev.filter(e => e.id !== id));

  const uploadFile = useCallback(async (entry: FileEntry) => {
    const { id, file } = entry;
    updateEntry(id, { step: "extracting" });

    const formData = new FormData();
    formData.append("file", file);

    const timer1 = setTimeout(() => updateEntry(id, { step: "embedding" }), 1200);
    const timer2 = setTimeout(() => updateEntry(id, { step: "indexing" }), 2400);

    try {
      const res = await fetch("/api/proxy/documents/upload", {
        method: "POST",
        body: formData,
        headers: { "x-file-type": file.type },
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res.status === 402) {
        const data = await res.json();
        updateEntry(id, { step: "error", error: "Límite de documentos alcanzado" });
        setEntries(prev => prev.map(e =>
          e.step === "idle" ? { ...e, step: "error" as Step, error: "Límite alcanzado" } : e
        ));
        setUpgradeReason(data.reason);
        setUpgradeOpen(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Error del servidor");
      }

      const data: UploadResult = await res.json();
      updateEntry(id, { step: "done", result: data });
      toast.success(`"${data.filename}" indexado correctamente.`);
      onSuccess?.();
    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      updateEntry(id, { step: "error", error: (err as Error).message });
      toast.error(`Error al subir "${file.name}".`);
    }
  }, [updateEntry, onSuccess]);

  // Cola secuencial: cuando un archivo termina, empieza el siguiente idle
  useEffect(() => {
    const idleEntry = entries.find(e => e.step === "idle");
    const isProcessing = entries.some(e =>
      (["extracting", "embedding", "indexing"] as Step[]).includes(e.step)
    );

    if (idleEntry && !isProcessing && !isStartingRef.current) {
      isStartingRef.current = true;
      uploadFile(idleEntry).finally(() => {
        isStartingRef.current = false;
      });
    }
  }, [entries, uploadFile]);

  const onDropAccepted = useCallback((files: File[]) => {
    const newEntries: FileEntry[] = files.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      step: "idle" as Step,
      result: null,
    }));
    setEntries(prev => [...prev, ...newEntries]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    onDropAccepted,
    onDropRejected: () => toast.error("Solo PDF, JPG o PNG."),
  });

  return (
    <>
      <div className="space-y-6 w-full max-w-4xl">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            OCR automático incluido
          </div>
          <h2 className="font-heading text-2xl font-bold text-white">Subir documentos</h2>
          <p className="text-slate-400 text-sm">
            PDF (texto o escaneado), JPG o PNG. El texto se extrae, fragmenta e indexa automáticamente.
          </p>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 transition-all duration-200",
            isDragActive
              ? "border-violet-500 bg-violet-500/10 shadow-[0_0_40px_rgba(139,92,246,0.15)]"
              : "border-slate-700 bg-slate-900/50 hover:border-violet-500/60 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]",
          )}
        >
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-700/10 rounded-full blur-[60px]" />
          </div>

          <input {...getInputProps()} multiple />

          <div className={cn(
            "flex size-14 items-center justify-center rounded-2xl transition-colors",
            isDragActive ? "bg-violet-500/20" : "bg-slate-800",
          )}>
            <Upload className={cn("size-6 transition-colors", isDragActive ? "text-violet-400" : "text-slate-400")} />
          </div>

          <div className="text-center space-y-1 relative">
            <p className="text-sm font-medium text-slate-200">
              {isDragActive ? "Suelta los archivos aquí" : "Arrastra archivos o haz clic para seleccionar"}
            </p>
            <p className="text-xs text-slate-500">PDF · JPG · PNG — múltiples archivos permitidos</p>
          </div>

          <div className="flex gap-2 relative">
            {["PDF", "JPG", "PNG"].map((fmt) => (
              <span key={fmt} className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-full">
                {fmt}
              </span>
            ))}
          </div>
        </div>

        {/* File list */}
        {entries.length > 0 && (
          <div className="space-y-2">
            {entries.map((entry) => {
              const isProcessing = (["extracting", "embedding", "indexing"] as Step[]).includes(entry.step);
              const isDone = entry.step === "done";
              const isError = entry.step === "error";

              if (isError) {
                return (
                  <div key={entry.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-red-500/15 shrink-0">
                      <XCircle className="size-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-red-300 truncate">{entry.file.name}</p>
                      <p className="text-xs text-slate-500">{entry.error ?? "Error al procesar"}</p>
                    </div>
                    <button onClick={() => removeEntry(entry.id)} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
                      <X className="size-4" />
                    </button>
                  </div>
                );
              }

              // idle, processing y done en una sola tarjeta para que AnimatedProgressBar
              // no se desmonte al terminar y pueda animar hasta 100%
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "rounded-xl border p-4 space-y-3 transition-colors duration-500",
                    isDone ? "border-emerald-500/20 bg-emerald-500/5" : "border-slate-800 bg-slate-900/80",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex size-9 items-center justify-center rounded-xl shrink-0 transition-colors duration-300",
                      isDone ? "bg-emerald-500/15" : "bg-violet-500/10",
                    )}>
                      {isDone
                        ? <CheckCircle2 className="size-4 text-emerald-400" />
                        : isProcessing
                          ? <Loader2 className="size-4 animate-spin text-violet-400" />
                          : <FileText className="size-4 text-slate-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-200 truncate">
                        {isDone && entry.result ? entry.result.filename : entry.file.name}
                      </p>
                      <p className="text-xs text-slate-500">{STEP_LABELS[entry.step]}</p>
                    </div>
                    {!isProcessing && (
                      <button onClick={() => removeEntry(entry.id)} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>

                  <AnimatedProgressBar active={isProcessing} done={isDone} />

                  {isDone && entry.result && (
                    <div className="flex flex-wrap gap-1.5">
                      <Badge className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800 text-[10px] py-0">{entry.result.pages} págs.</Badge>
                      <Badge className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800 text-[10px] py-0">{entry.result.chunks} fragmentos</Badge>
                      {entry.result.source_type === "pdf_ocr" && (
                        <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/10 text-[10px] py-0">PDF OCR</Badge>
                      )}
                      {entry.result.source_type === "image_ocr" && (
                        <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 text-[10px] py-0">Imagen OCR</Badge>
                      )}
                      {entry.result.ocr_confidence != null && (
                        <Badge className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800 text-[10px] py-0">OCR {entry.result.ocr_confidence}%</Badge>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason={upgradeReason}
      />
    </>
  );
}
