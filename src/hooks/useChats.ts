"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import type { ChatSession } from "@/types/chat";

let chatsCache: ChatSession[] | null = null;
let chatsRequest: Promise<ChatSession[]> | null = null;

async function loadChats(force = false) {
  if (!force && chatsCache) return chatsCache;
  if (!force && chatsRequest) return chatsRequest;

  chatsRequest = fetch("/api/proxy/chats")
    .then(async (res) => {
      if (!res.ok) return [];
      const data = await res.json();
      const chats = data.chats ?? [];
      chatsCache = chats;
      return chats;
    })
    .finally(() => {
      chatsRequest = null;
    });

  return chatsRequest;
}

export function useChats() {
  const { isLoaded, isSignedIn } = useUser();
  const [chats, setChats] = useState<ChatSession[]>(chatsCache ?? []);
  const [loading, setLoading] = useState(!chatsCache);

  const fetchChats = useCallback(async (force = false) => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      chatsCache = [];
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setChats(await loadChats(force));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => { fetchChats(false); }, [fetchChats]);

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
      chatsCache = [chat, ...(chatsCache ?? [])];
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
      chatsCache = (chatsCache ?? []).filter((c) => c.id !== chatId);
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
      chatsCache = (chatsCache ?? []).map((c) => c.id === chatId ? { ...c, title } : c);
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
      chatsCache = (chatsCache ?? []).map((c) => c.id === chatId ? { ...c, share_token: token } : c);
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
      chatsCache = (chatsCache ?? []).map((c) => c.id === chatId ? { ...c, share_token: null } : c);
      return true;
    } catch {
      return false;
    }
  }, []);

  const updateLocalTitle = useCallback((chatId: string, title: string) => {
    setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, title } : c));
    chatsCache = (chatsCache ?? []).map((c) => c.id === chatId ? { ...c, title } : c);
  }, []);

  const refetch = useCallback(() => fetchChats(true), [fetchChats]);

  return { chats, loading, createChat, deleteChat, renameChat, shareChat, unshareChat, updateLocalTitle, refetch };
}
