"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

    // Simulate step progression while uploading
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
      <div className="space-y-4 max-w-2xl">
        <h2 className="font-heading text-2xl font-semibold">Subir documento</h2>
        <p className="text-muted-foreground text-sm">PDF (texto o escaneado), JPG o PNG. El texto se extrae, fragmenta e indexa automáticamente.</p>

        {step === "idle" && (
          <div
            {...getRootProps()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 transition-colors",
              isDragActive
                ? "border-violet-500 bg-violet-500/5"
                : "border-muted-foreground/25 hover:border-violet-400 hover:bg-muted/50",
            )}
          >
            <input {...getInputProps()} />
            <Upload className="size-10 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              {isDragActive ? "Suelta el archivo aquí" : "Arrastra un archivo o haz clic para seleccionar"}
            </p>
            <p className="text-xs text-muted-foreground/60">PDF · JPG · PNG</p>
          </div>
        )}

        {isProcessing && (
          <Card>
            <CardContent className="py-6 space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="size-5 animate-spin text-violet-500" />
                <div>
                  <p className="font-medium text-sm">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">{STEP_LABELS[step]}</p>
                </div>
              </div>
              <Progress value={STEP_PROGRESS[step]} className="h-2" />
            </CardContent>
          </Card>
        )}

        {step === "done" && result && (
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="py-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-5" />
                <span className="font-semibold">{result.filename}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">{result.pages} páginas</Badge>
                <Badge variant="secondary">{result.chunks} fragmentos</Badge>
                {result.source_type === "pdf_text" && <Badge variant="secondary">PDF texto</Badge>}
                {result.source_type === "pdf_ocr" && <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400">PDF OCR</Badge>}
                {result.source_type === "image_ocr" && <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">Imagen OCR</Badge>}
                {result.ocr_confidence != null && (
                  <Badge variant="outline">Confianza OCR: {result.ocr_confidence}%</Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={reset}>Subir otro</Button>
            </CardContent>
          </Card>
        )}

        {step === "error" && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-6 flex items-center gap-3">
              <XCircle className="size-5 text-destructive" />
              <div>
                <p className="font-medium text-sm text-destructive">Error al procesar</p>
                <Button variant="link" size="sm" className="px-0 h-auto" onClick={reset}>Intentar de nuevo</Button>
              </div>
            </CardContent>
          </Card>
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
