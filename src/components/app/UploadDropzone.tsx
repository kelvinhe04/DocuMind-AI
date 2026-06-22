"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { CheckCircle2, FileText, Loader2, ScanText, Upload, X, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UploadResult } from "@/types/document";
import { UpgradeDialog } from "./UpgradeDialog";

function AnimatedProgressBar({ active, done }: { active: boolean; done: boolean }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
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
    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-full transition-[width] duration-500 ease-out",
          done ? "bg-emerald-500" : "bg-amber-400",
        )}
        style={{ width: `${progress}%` }}
      >
        {!done && <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />}
      </div>
    </div>
  );
}

type Step = "idle" | "extracting" | "embedding" | "indexing" | "done" | "error";

const STEP_LABELS: Record<Step, string> = {
  idle: "En cola...",
  extracting: "Extrayendo texto...",
  embedding: "Preparando vectores...",
  indexing: "Indexando contenido...",
  done: "Listo",
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
    setEntries((prev) => prev.map((entry) => entry.id === id ? { ...entry, ...patch } : entry)), []);

  const removeEntry = (id: string) =>
    setEntries((prev) => prev.filter((entry) => entry.id !== id));

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
        updateEntry(id, { step: "error", error: "Limite de documentos alcanzado" });
        setEntries((prev) => prev.map((item) =>
          item.step === "idle" ? { ...item, step: "error" as Step, error: "Limite alcanzado" } : item,
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

  useEffect(() => {
    const idleEntry = entries.find((entry) => entry.step === "idle");
    const isProcessing = entries.some((entry) =>
      (["extracting", "embedding", "indexing"] as Step[]).includes(entry.step),
    );

    if (idleEntry && !isProcessing && !isStartingRef.current) {
      isStartingRef.current = true;
      uploadFile(idleEntry).finally(() => {
        isStartingRef.current = false;
      });
    }
  }, [entries, uploadFile]);

  const onDropAccepted = useCallback((files: File[]) => {
    const newEntries: FileEntry[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      step: "idle",
      result: null,
    }));
    setEntries((prev) => [...prev, ...newEntries]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    onDropAccepted,
    onDropRejected: () => toast.error("Solo PDF, JPG o PNG."),
  });

  return (
    <>
      <div className="space-y-5">
        <section className="app-panel overflow-hidden rounded-lg">
          <div className="border-b border-zinc-800/70 bg-[linear-gradient(135deg,rgba(245,158,11,0.10),transparent_42%)] p-5">
            <div className="app-kicker inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium">
              <ScanText className="size-3.5" />
              OCR automatico incluido
            </div>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white">Subir documentos</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
              Carga PDF, JPG o PNG para extraer texto, fragmentarlo e indexarlo.
            </p>
          </div>

          <div className="p-5">
            <div
              {...getRootProps()}
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
                isDragActive
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-zinc-700 bg-zinc-950/45 hover:border-amber-400/60 hover:bg-zinc-900/70",
              )}
            >
              <input {...getInputProps()} multiple />
              <div className={cn(
                "flex size-14 items-center justify-center rounded-lg transition-colors",
                isDragActive ? "bg-amber-500/20" : "bg-zinc-800",
              )}>
                <Upload className={cn("size-6 transition-colors", isDragActive ? "text-amber-200" : "text-zinc-400")} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-200">
                  {isDragActive ? "Suelta los archivos aqui" : "Arrastra archivos o haz clic para seleccionar"}
                </p>
                <p className="text-xs text-zinc-500">PDF, JPG y PNG. Puedes subir multiples archivos.</p>
              </div>
              <div className="flex gap-2">
                {["PDF", "JPG", "PNG"].map((format) => (
                  <span key={format} className="rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {entries.length > 0 && (
          <section className="app-panel rounded-lg">
            <div className="border-b border-zinc-800/70 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Cola de procesamiento</h3>
              <p className="text-xs text-zinc-500">Los archivos se procesan de forma secuencial.</p>
            </div>
            <div className="space-y-2 p-3">
              {entries.map((entry) => {
                const isProcessing = (["extracting", "embedding", "indexing"] as Step[]).includes(entry.step);
                const isDone = entry.step === "done";
                const isError = entry.step === "error";

                if (isError) {
                  return (
                    <div key={entry.id} className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
                        <XCircle className="size-4 text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-red-300">{entry.file.name}</p>
                        <p className="text-xs text-zinc-500">{entry.error ?? "Error al procesar"}</p>
                      </div>
                      <button onClick={() => removeEntry(entry.id)} className="shrink-0 text-zinc-500 transition-colors hover:text-zinc-300">
                        <X className="size-4" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "space-y-3 rounded-lg border p-4 transition-colors duration-500",
                      isDone ? "border-emerald-500/20 bg-emerald-500/5" : "border-zinc-800 bg-zinc-900/80",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300",
                        isDone ? "bg-emerald-500/15" : "bg-amber-500/10",
                      )}>
                        {isDone ? (
                          <CheckCircle2 className="size-4 text-emerald-400" />
                        ) : isProcessing ? (
                          <Loader2 className="size-4 animate-spin text-amber-300" />
                        ) : (
                          <FileText className="size-4 text-zinc-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {isDone && entry.result ? entry.result.filename : entry.file.name}
                        </p>
                        <p className="text-xs text-zinc-500">{STEP_LABELS[entry.step]}</p>
                      </div>
                      {!isProcessing && (
                        <button onClick={() => removeEntry(entry.id)} className="shrink-0 text-zinc-500 transition-colors hover:text-zinc-300">
                          <X className="size-4" />
                        </button>
                      )}
                    </div>

                    <AnimatedProgressBar active={isProcessing} done={isDone} />

                    {isDone && entry.result && (
                      <div className="flex flex-wrap gap-1.5">
                        <Badge className="border-zinc-700 bg-zinc-800 py-0 text-[10px] text-zinc-300 hover:bg-zinc-800">{entry.result.pages} pags.</Badge>
                        <Badge className="border-zinc-700 bg-zinc-800 py-0 text-[10px] text-zinc-300 hover:bg-zinc-800">{entry.result.chunks} fragmentos</Badge>
                        {entry.result.source_type === "pdf_ocr" && (
                          <Badge className="border-amber-500/20 bg-amber-500/10 py-0 text-[10px] text-amber-300 hover:bg-amber-500/10">PDF OCR</Badge>
                        )}
                        {entry.result.source_type === "image_ocr" && (
                          <Badge className="border-emerald-500/20 bg-emerald-500/10 py-0 text-[10px] text-emerald-300 hover:bg-emerald-500/10">Imagen OCR</Badge>
                        )}
                        {entry.result.ocr_confidence != null && (
                          <Badge className="border-zinc-700 bg-zinc-800 py-0 text-[10px] text-zinc-300 hover:bg-zinc-800">OCR {entry.result.ocr_confidence}%</Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
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
