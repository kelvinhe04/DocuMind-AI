"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Source } from "@/types/chat";

interface Props {
  sources: Source[];
}

export function SourceCitations({ sources }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  if (!sources || sources.length === 0) return null;

  const visible = expanded ? sources : sources.slice(0, 3);

  return (
    <>
      <div className="mt-3 space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Fuentes</p>
        <div className="flex flex-wrap gap-2">
          {visible.map((source, index) => (
            <button
              key={index}
              onClick={() => setSelectedSource(source)}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/70 px-2 py-1 text-xs text-zinc-300 transition-colors hover:border-violet-500/30 hover:bg-violet-500/10"
            >
              <FileText className="size-3 text-violet-400" />
              <span className="max-w-[160px] truncate">{source.filename}</span>
              <span className="text-zinc-600">p.{source.page}</span>
              <Badge variant="outline" className="border-zinc-700 px-1 py-0 text-[10px] text-zinc-400">
                {(source.score * 100).toFixed(0)}%
              </Badge>
            </button>
          ))}
          {sources.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="mr-1 size-3" />Menos
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 size-3" />+{sources.length - 3} mas
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={!!selectedSource} onOpenChange={() => setSelectedSource(null)}>
        <DialogContent className="max-w-lg border-zinc-800 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-violet-400" />
              {selectedSource?.filename} - pagina {selectedSource?.page}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-zinc-800 bg-zinc-900/70 p-4 text-sm leading-relaxed text-zinc-300">
            {selectedSource?.text}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Badge variant="secondary">
              Score: {selectedSource ? (selectedSource.score * 100).toFixed(1) : 0}%
            </Badge>
            {selectedSource?.source_type && <Badge variant="outline">{selectedSource.source_type}</Badge>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
