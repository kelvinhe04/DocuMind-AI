"use client";

import { useState, useCallback } from "react";
import type { ChatMessage, ChatResponse } from "@/types/chat";

const TIMEOUT_MS = 30_000;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(
    async (question: string, mode: "chat" | "search" = "chat", filterDoc?: string) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const res = await fetch("/api/proxy/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, mode, top_k: 5, filter_doc: filterDoc ?? null }),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.detail ?? `Error ${res.status}`);
        }

        const data: ChatResponse = await res.json();
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer ?? "",
          sources: data.sources,
          used_llm: data.used_llm,
          latency_ms: data.latency_ms,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return assistantMsg;
      } catch (err: unknown) {
        clearTimeout(timer);
        const isTimeout = (err as Error)?.name === "AbortError";
        const content = isTimeout
          ? "⏱️ La respuesta tardó demasiado. El backend RAG puede estar procesando una consulta pesada. Intenta de nuevo."
          : `⚠️ ${(err as Error)?.message ?? "Error al conectar con el backend."}`;

        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, loading, sendMessage, clearMessages };
}
