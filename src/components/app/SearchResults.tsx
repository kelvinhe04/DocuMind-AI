"use client";

import { useState } from "react";
import { Search, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Source, ChatResponse } from "@/types/chat";

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded px-0.5">{p}</mark>
      : p,
  );
}

export function SearchResults() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  const search = async () => {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await api.post<ChatResponse>("/chat", { question: q, mode: "search", top_k: 8 });
      setResults(res.data.sources ?? []);
      setLatency(res.data.latency_ms);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") search();
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="font-heading text-2xl font-semibold">Búsqueda semántica</h2>
      <p className="text-sm text-muted-foreground">
        Encuentra los fragmentos más relevantes en tus documentos sin necesidad de coincidencia exacta.
      </p>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          placeholder="¿Qué estás buscando?"
          className="flex-1"
        />
        <Button onClick={search} disabled={!query.trim() || loading} className="bg-violet-600 hover:bg-violet-700">
          {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Search className="size-4 mr-2" />}
          Buscar
        </Button>
      </div>

      {searched && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{results.length} resultado{results.length !== 1 ? "s" : ""}</span>
          {latency != null && <span>· {latency}ms</span>}
        </div>
      )}

      <div className="space-y-3">
        {results.map((r, i) => (
          <Card key={i}>
            <CardContent className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="size-4 text-violet-500" />
                  {r.filename}
                  <Badge variant="outline" className="text-xs">p.{r.page}</Badge>
                </div>
                <Badge
                  className={
                    r.score > 0.7
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      : r.score > 0.4
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {(r.score * 100).toFixed(0)}% relevancia
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {highlight(r.text.slice(0, 400) + (r.text.length > 400 ? "…" : ""), query)}
              </p>
            </CardContent>
          </Card>
        ))}

        {searched && results.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            Sin resultados para <strong>&ldquo;{query}&rdquo;</strong>. Intenta con otras palabras.
          </div>
        )}
      </div>
    </div>
  );
}
