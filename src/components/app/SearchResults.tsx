"use client";

import { useState } from "react";
import { FileText, Loader2, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { ChatResponse, Source } from "@/types/chat";

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={index} className="rounded bg-cyan-500/20 px-0.5 text-cyan-100">{part}</mark>
      : part,
  );
}

function scoreClass(score: number) {
  if (score > 0.7) return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
  if (score > 0.4) return "border-cyan-500/25 bg-cyan-500/10 text-cyan-300";
  return "border-zinc-700 bg-zinc-800 text-zinc-400";
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
      setLatency(null);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") search();
  };

  return (
    <div className="space-y-5">
      <section className="app-panel overflow-hidden rounded-lg">
        <div className="border-b border-zinc-800/70 bg-[linear-gradient(135deg,rgba(139,92,246,0.10),transparent_42%)] p-5">
          <div className="app-kicker inline-flex rounded-md px-2.5 py-1 text-xs font-medium">Exploracion</div>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white">Busqueda semantica</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
            Encuentra fragmentos relevantes aunque el texto no coincida palabra por palabra.
          </p>
        </div>

        <div className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKey}
                placeholder="Que estas buscando?"
                className="h-11 border-zinc-800 bg-zinc-950 pl-9 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-violet-500/30"
              />
            </div>
            <Button
              onClick={search}
              disabled={!query.trim() || loading}
              className="h-11 bg-violet-600 text-white hover:bg-violet-500"
            >
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}
              Buscar
            </Button>
          </div>

          {searched && (
            <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
              <span>{results.length} resultado{results.length !== 1 ? "s" : ""}</span>
              {latency != null && <span>- {latency}ms</span>}
            </div>
          )}
        </div>
      </section>

      <div className="space-y-3">
        {results.map((result, index) => (
          <article key={index} className="app-panel rounded-lg p-4 transition-colors hover:border-zinc-700">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-violet-400">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-100">{result.filename}</p>
                  <p className="text-xs text-zinc-500">Pagina {result.page}</p>
                </div>
              </div>
              <Badge className={scoreClass(result.score)}>
                {(result.score * 100).toFixed(0)}% relevancia
              </Badge>
            </div>
            <p className="mt-4 border-l border-violet-500/30 pl-4 text-sm leading-7 text-zinc-300">
              {highlight(result.text.slice(0, 520) + (result.text.length > 520 ? "..." : ""), query)}
            </p>
          </article>
        ))}

        {searched && results.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/60 py-14 text-center">
            <Search className="mx-auto size-7 text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-400">
              Sin resultados para <strong className="text-zinc-200">{query}</strong>.
            </p>
            <p className="mt-1 text-xs text-zinc-600">Prueba con un concepto mas amplio.</p>
          </div>
        )}
      </div>
    </div>
  );
}
