"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChatSession } from "@/types/chat";

export function useChats() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch("/api/proxy/chats");
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  const createChat = useCallback(async (title = "Nueva conversación"): Promise<ChatSession | null> => {
    try {
      const res = await fetch("/api/proxy/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) return null;
      const chat: ChatSession = await res.json();
      setChats((prev) => [chat, ...prev]);
      return chat;
    } catch {
      return null;
    }
  }, []);

  const deleteChat = useCallback(async (chatId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/proxy/chats/${chatId}`, { method: "DELETE" });
      if (!res.ok) return false;
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      return true;
    } catch {
      return false;
    }
  }, []);

  const renameChat = useCallback(async (chatId: string, title: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/proxy/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) return false;
      setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, title } : c));
      return true;
    } catch {
      return false;
    }
  }, []);

  const shareChat = useCallback(async (chatId: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/proxy/chats/${chatId}/share`, { method: "POST" });
      if (!res.ok) return null;
      const data = await res.json();
      const token: string = data.share_token;
      setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, share_token: token } : c));
      return token;
    } catch {
      return null;
    }
  }, []);

  const unshareChat = useCallback(async (chatId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/proxy/chats/${chatId}/share`, { method: "DELETE" });
      if (!res.ok) return false;
      setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, share_token: null } : c));
      return true;
    } catch {
      return false;
    }
  }, []);

  const updateLocalTitle = useCallback((chatId: string, title: string) => {
    setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, title } : c));
  }, []);

  return { chats, loading, createChat, deleteChat, renameChat, shareChat, unshareChat, updateLocalTitle, refetch: fetchChats };
}
