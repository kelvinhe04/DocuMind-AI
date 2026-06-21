"use client";

import { useState } from "react";
import { FileText, ImageIcon, ScanText, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useDocuments } from "@/hooks/useDocuments";
import type { Document } from "@/types/document";

function SourceBadge({ type }: { type: Document["source_type"] }) {
  if (type === "pdf_text") return <Badge variant="secondary"><FileText className="mr-1 size-3" />PDF</Badge>;
  if (type === "pdf_ocr") return <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400"><ScanText className="mr-1 size-3" />PDF OCR</Badge>;
  return <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"><ImageIcon className="mr-1 size-3" />Imagen OCR</Badge>;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold">Documentos</h2>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      <Input
        placeholder="Buscar por nombre…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-xs"
      />

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Archivo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-center">Páginas</TableHead>
              <TableHead className="text-center">Fragmentos</TableHead>
              <TableHead className="text-center">Confianza OCR</TableHead>
              <TableHead>Subido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      {filter ? "Sin resultados para esa búsqueda." : "No hay documentos cargados aún."}
                    </TableCell>
                  </TableRow>
                )
              : filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.filename}</TableCell>
                    <TableCell><SourceBadge type={doc.source_type} /></TableCell>
                    <TableCell className="text-center">{doc.pages}</TableCell>
                    <TableCell className="text-center">{doc.chunks}</TableCell>
                    <TableCell className="text-center">
                      {doc.ocr_confidence != null ? `${doc.ocr_confidence}%` : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(doc.uploaded_at)}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
