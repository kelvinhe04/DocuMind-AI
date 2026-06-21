"use client";

import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  reason?: string;
}

export function UpgradeDialog({ open, onClose, reason }: Props) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="size-5 text-amber-500" />
            Actualiza tu plan
          </DialogTitle>
          <DialogDescription className="pt-1">
            {reason ?? "Has alcanzado el límite de tu plan actual."}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 text-sm text-muted-foreground">
          El plan <span className="font-semibold text-violet-500">Starter ($49/mes)</span> incluye
          documentos ilimitados, OCR de imágenes y consultas ilimitadas.
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            onClick={() => { onClose(); router.push("/pricing"); }}
          >
            Ver planes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
