"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, CheckCircle2, XCircle, Loader2, FileText, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpgradeDialog } from "./UpgradeDialog";
import { cn } from "@/lib/utils";
import type { UploadResult } from "@/types/document";

type Step = "idle" | "extracting" | "embedding" | "indexing" | "done" | "error";

const STEP_LABELS: Record<Step, string> = {
  idle: "",
  extracting: "Extrayendo texto…",
  embedding: "Generando embeddings…",
  indexing: "Indexando en ChromaDB…",
  done: "¡Listo!",
  error: "Error al procesar",
};

const STEP_PROGRESS: Record<Step, number> = {
  idle: 0, extracting: 30, embedding: 65, indexing: 90, done: 100, error: 100,
};

interface Props {
  onSuccess?: () => void;
}

export function UploadDropzone({ onSuccess }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>();
  const [file, setFile] = useState<File | null>(null);

  const reset = () => { setStep("idle"); setResult(null); setFile(null); };

  const upload = useCallback(async (f: File) => {
    setFile(f);
    setStep("extracting");

    const formData = new FormData();
    formData.append("file", f);

    const timer1 = setTimeout(() => setStep("embedding"), 1200);
    const timer2 = setTimeout(() => setStep("indexing"), 2400);

    try {
      const res = await fetch("/api/proxy/documents/upload", {
        method: "POST",
        body: formData,
        headers: { "x-file-type": f.type },
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res.status === 402) {
        const data = await res.json();
        setStep("idle");
        setFile(null);
        setUpgradeReason(data.reason);
        setUpgradeOpen(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Error del servidor");
      }

      const data: UploadResult = await res.json();
      setResult(data);
      setStep("done");
      toast.success(`"${data.filename}" indexado correctamente.`);
      onSuccess?.();
    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setStep("error");
      toast.error((err as Error).message ?? "Error al subir el archivo.");
    }
  }, [onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxFiles: 1,
    disabled: step !== "idle",
    onDropAccepted: ([f]) => upload(f),
    onDropRejected: () => toast.error("Solo PDF, JPG o PNG. Un archivo a la vez."),
  });

  const isProcessing = step === "extracting" || step === "embedding" || step === "indexing";

  return (
    <>
      <div className="space-y-6 w-full max-w-4xl">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            OCR automático incluido
          </div>
          <h2 className="font-heading text-2xl font-bold text-white">Subir documento</h2>
          <p className="text-slate-400 text-sm">
            PDF (texto o escaneado), JPG o PNG. El texto se extrae, fragmenta e indexa automáticamente.
          </p>
        </div>

        {/* Dropzone */}
        {step === "idle" && (
          <div
            {...getRootProps()}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-14 transition-all duration-200",
              isDragActive
                ? "border-violet-500 bg-violet-500/10 shadow-[0_0_40px_rgba(139,92,246,0.15)]"
                : "border-slate-700 bg-slate-900/50 hover:border-violet-500/60 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]",
            )}
          >
            {/* glow blob */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-700/10 rounded-full blur-[60px]" />
            </div>

            <input {...getInputProps()} />

            <div className={cn(
              "flex size-16 items-center justify-center rounded-2xl transition-colors",
              isDragActive ? "bg-violet-500/20" : "bg-slate-800",
            )}>
              <Upload className={cn("size-7 transition-colors", isDragActive ? "text-violet-400" : "text-slate-400")} />
            </div>

            <div className="text-center space-y-1 relative">
              <p className="text-sm font-medium text-slate-200">
                {isDragActive ? "Suelta el archivo aquí" : "Arrastra un archivo o haz clic para seleccionar"}
              </p>
              <p className="text-xs text-slate-500">PDF · JPG · PNG — máx. 1 archivo</p>
            </div>

            <div className="flex gap-2 relative">
              {["PDF", "JPG", "PNG"].map((fmt) => (
                <span
                  key={fmt}
                  className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-full"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Processing */}
        {isProcessing && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Loader2 className="size-5 animate-spin text-violet-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-slate-200">{file?.name}</p>
                <p className="text-xs text-slate-500">{STEP_LABELS[step]}</p>
              </div>
            </div>
            <Progress value={STEP_PROGRESS[step]} className="h-1.5 bg-slate-800 [&>div]:bg-violet-500" />
            <div className="flex gap-3 text-xs">
              {(["extracting", "embedding", "indexing"] as const).map((s) => (
                <span
                  key={s}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    step === s ? "text-violet-400" : STEP_PROGRESS[s] < STEP_PROGRESS[step] ? "text-slate-500 line-through" : "text-slate-600",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", step === s ? "bg-violet-400" : STEP_PROGRESS[s] < STEP_PROGRESS[step] ? "bg-slate-600" : "bg-slate-700")} />
                  {STEP_LABELS[s]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        {step === "done" && result && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15">
                <CheckCircle2 className="size-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">{result.filename}</p>
                <p className="text-xs text-emerald-400">Indexado correctamente</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800">{result.pages} páginas</Badge>
              <Badge className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800">{result.chunks} fragmentos</Badge>
              {result.source_type === "pdf_text" && <Badge className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800">PDF texto</Badge>}
              {result.source_type === "pdf_ocr" && <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/10">PDF OCR</Badge>}
              {result.source_type === "image_ocr" && <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">Imagen OCR</Badge>}
              {result.ocr_confidence != null && (
                <Badge className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800">Confianza OCR: {result.ocr_confidence}%</Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <FileText className="size-3.5 mr-1.5" />
              Subir otro
            </Button>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/15">
              <XCircle className="size-5 text-red-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-red-300">Error al procesar el archivo</p>
              <button
                onClick={reset}
                className="text-xs text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline mt-0.5"
              >
                Intentar de nuevo
              </button>
            </div>
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
