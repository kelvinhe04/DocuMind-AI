"use client";

import { useState, useCallback, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import type { ChatMessage, ChatResponse } from "@/types/chat";

const TIMEOUT_MS = 30_000;
const messageCache = new Map<string, ChatMessage[]>();
const messageRequests = new Map<string, Promise<ChatMessage[]>>();

function normalizeMessages(data: {
  messages?: Array<{
    id: number;
    role: string;
    content: string;
    sources?: unknown;
    used_llm?: boolean;
    latency_ms?: number;
    created_at: string;
  }>;
}): ChatMessage[] {
  return (data.messages ?? []).map((m) => ({
    id: String(m.id),
    role: m.role as "user" | "assistant",
    content: m.content,
    sources: (m.sources as ChatMessage["sources"]) ?? undefined,
    used_llm: m.used_llm ?? undefined,
    latency_ms: m.latency_ms ?? undefined,
    timestamp: new Date(m.created_at),
  }));
}

async function loadMessages(chatId: string, force = false) {
  if (!force && messageCache.has(chatId)) return messageCache.get(chatId) ?? [];
  if (!force && messageRequests.has(chatId)) return messageRequests.get(chatId) ?? Promise.resolve([]);

  const request = fetch(`/api/proxy/chats/${chatId}/messages`)
    .then((r) => (r.ok ? r.json() : { messages: [] }))
    .then((data) => {
      const messages = normalizeMessages(data);
      messageCache.set(chatId, messages);
      return messages;
    })
    .catch(() => []);

  messageRequests.set(chatId, request);
  request.finally(() => messageRequests.delete(chatId));
  return request;
}

export function useChat(chatId: string | null, onTitleUpdate?: (id: string, title: string) => void) {
  const { isLoaded, isSignedIn } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>(chatId ? (messageCache.get(chatId) ?? []) : []);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load persisted messages when chatId changes
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    if (!isLoaded) return;
    if (!isSignedIn) {
      setMessages([]);
      setHistoryLoading(false);
      return;
    }
    if (messageCache.has(chatId)) {
      setMessages(messageCache.get(chatId) ?? []);
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);
    loadMessages(chatId)
      .then((msgs) => {
        if (!cancelled) setMessages(msgs);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chatId, isLoaded, isSignedIn]);

  const sendMessage = useCallback(
    async (question: string, mode: "chat" | "search" = "chat", filterDoc?: string, targetChatId = chatId) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const next = [...prev, userMsg];
        if (targetChatId) messageCache.set(targetChatId, next);
        return next;
      });
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
            top_k: 8,
            filter_doc: filterDoc ?? null,
            chat_id: targetChatId ?? null,
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
        setMessages((prev) => {
          const next = [...prev, assistantMsg];
          if (targetChatId) messageCache.set(targetChatId, next);
          return next;
        });

        // After first user message the backend auto-titles the chat
        if (targetChatId && onTitleUpdate && messages.length === 0) {
          onTitleUpdate(targetChatId, question.slice(0, 60));
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
        setMessages((prev) => {
          const next = [...prev, errorMsg];
          if (targetChatId) messageCache.set(targetChatId, next);
          return next;
        });
      } finally {
        setLoading(false);
      }
    },
    [chatId, messages.length, onTitleUpdate],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, loading, historyLoading, sendMessage, clearMessages };
}
