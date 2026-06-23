"use client";

import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  reason?: string;
}

export function UpgradeDialog({ open, onClose, reason }: Props) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="size-5 text-violet-400" />
            Actualiza tu plan
          </DialogTitle>
          <DialogDescription className="pt-1 text-zinc-400">
            {reason ?? "Has alcanzado el limite de tu plan actual."}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-violet-500/25 bg-violet-500/10 p-4 text-sm text-zinc-300">
          El plan <span className="font-semibold text-violet-300">Starter ($49/mes)</span> incluye
          documentos ilimitados, OCR de imagenes y consultas ilimitadas.
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white">
            Cancelar
          </Button>
          <Button
            className="bg-violet-600 text-white hover:bg-violet-500"
            onClick={() => {
              onClose();
              router.push("/pricing");
            }}
          >
            Ver planes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
