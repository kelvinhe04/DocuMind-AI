"use client";

import { useState, useCallback, useEffect } from "react";
import type { ChatMessage, ChatResponse } from "@/types/chat";

const TIMEOUT_MS = 30_000;

export function useChat(chatId: string | null, onTitleUpdate?: (id: string, title: string) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load persisted messages when chatId changes
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    setHistoryLoading(true);
    fetch(`/api/proxy/chats/${chatId}/messages`)
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((data) => {
        const msgs: ChatMessage[] = (data.messages ?? []).map((m: {
          id: number; role: string; content: string;
          sources?: unknown; used_llm?: boolean; latency_ms?: number; created_at: string;
        }) => ({
          id: String(m.id),
          role: m.role as "user" | "assistant",
          content: m.content,
          sources: m.sources ?? undefined,
          used_llm: m.used_llm ?? undefined,
          latency_ms: m.latency_ms ?? undefined,
          timestamp: new Date(m.created_at),
        }));
        setMessages(msgs);
      })
      .catch(() => setMessages([]))
      .finally(() => setHistoryLoading(false));
  }, [chatId]);

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
          body: JSON.stringify({
            question,
            mode,
            top_k: 5,
            filter_doc: filterDoc ?? null,
            chat_id: chatId ?? null,
          }),
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

        // After first user message the backend auto-titles the chat
        if (chatId && onTitleUpdate && messages.length === 0) {
          onTitleUpdate(chatId, question.slice(0, 60));
        }

        return assistantMsg;
      } catch (err: unknown) {
        clearTimeout(timer);
        const isTimeout = (err as Error)?.name === "AbortError";
        const content = isTimeout
          ? "La respuesta tardó demasiado. El backend RAG puede estar procesando una consulta pesada. Intenta de nuevo."
          : `${(err as Error)?.message ?? "Error al conectar con el backend."}`;

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
    [chatId, messages.length, onTitleUpdate],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, loading, historyLoading, sendMessage, clearMessages };
}
