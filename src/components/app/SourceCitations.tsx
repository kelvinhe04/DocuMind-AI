"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
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
      <div className="mt-3 space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fuentes</p>
        <div className="flex flex-wrap gap-2">
          {visible.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelectedSource(s)}
              className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1 text-xs hover:bg-muted transition-colors cursor-pointer"
            >
              <FileText className="size-3 text-violet-500" />
              <span className="max-w-[160px] truncate">{s.filename}</span>
              <span className="text-muted-foreground">p.{s.page}</span>
              <Badge variant="outline" className="text-[10px] py-0 px-1">
                {(s.score * 100).toFixed(0)}%
              </Badge>
            </button>
          ))}
          {sources.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <><ChevronUp className="size-3 mr-1" />Menos</> : <><ChevronDown className="size-3 mr-1" />+{sources.length - 3} más</>}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={!!selectedSource} onOpenChange={() => setSelectedSource(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-violet-500" />
              {selectedSource?.filename} — página {selectedSource?.page}
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-md bg-muted p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
            {selectedSource?.text}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">Score: {selectedSource ? (selectedSource.score * 100).toFixed(1) : 0}%</Badge>
            {selectedSource?.source_type && (
              <Badge variant="outline">{selectedSource.source_type}</Badge>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
