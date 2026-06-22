"use client";

import { useEffect, useRef, useState } from "react";
import {
  Brain,
  Check,
  Copy,
  Loader2,
  MessageSquare,
  MessageSquarePlus,
  Pencil,
  Send,
  Share2,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ChatMessage, ChatSession } from "@/types/chat";
import { useChat } from "@/hooks/useChat";
import { useChats } from "@/hooks/useChats";
import { SourceCitations } from "./SourceCitations";

const promptIdeas = [
  "Resume el ultimo contrato cargado",
  "Encuentra riesgos o clausulas importantes",
  "Compara los documentos recientes",
];

function BotAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/25 bg-amber-400/10">
      <Brain className="size-4 text-amber-300" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200">
      <User className="size-4" />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <BotAvatar />
      <div className="app-panel rounded-lg px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 animate-bounce rounded-full bg-amber-300/70 [animation-delay:-0.3s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-amber-300/70 [animation-delay:-0.15s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-amber-300/70" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[78%] rounded-lg bg-zinc-100 px-4 py-3 text-sm leading-relaxed text-zinc-950 shadow-sm">
          <div className="whitespace-pre-wrap">{msg.content}</div>
        </div>
        <UserAvatar />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <BotAvatar />
      <div className="max-w-[78%] space-y-2">
        <div className="app-panel rounded-lg px-4 py-3 text-sm leading-7 text-zinc-200">
          <div className="whitespace-pre-wrap">{msg.content}</div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {msg.used_llm === false && (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="cursor-help border-amber-500/40 px-1.5 py-0 text-[10px] text-amber-300">
                  <Zap className="mr-1 size-2.5" />Extractivo
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-48 text-xs">
                Respuesta basada en fragmentos recuperados.
              </TooltipContent>
            </Tooltip>
          )}
          {msg.used_llm === true && (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="cursor-help border-emerald-500/35 px-1.5 py-0 text-[10px] text-emerald-300">
                  <Brain className="mr-1 size-2.5" />Generada
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Respuesta generada con contexto documental.
              </TooltipContent>
            </Tooltip>
          )}
          {msg.latency_ms != null && (
            <span className="text-[10px] text-zinc-600">{(msg.latency_ms / 1000).toFixed(2)}s</span>
          )}
        </div>
        {msg.sources && msg.sources.length > 0 && <SourceCitations sources={msg.sources} />}
      </div>
    </div>
  );
}

function ChatListItem({
  chat,
  active,
  onSelect,
  onDelete,
  onRename,
}: {
  chat: ChatSession;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(chat.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== chat.title) onRename(trimmed);
    setEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-amber-400/10 text-white shadow-[inset_3px_0_0_0_rgba(245,158,11,0.9)]"
          : "text-zinc-400 hover:bg-zinc-800/55 hover:text-zinc-100",
      )}
    >
      <MessageSquare className={cn("size-3.5 shrink-0", active ? "text-amber-300" : "text-zinc-600 group-hover:text-zinc-400")} />
      {editing ? (
        <input
          ref={inputRef}
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(chat.title);
              setEditing(false);
            }
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="min-w-0 flex-1 truncate">{chat.title}</span>
      )}

      <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => {
            setDraft(chat.title);
            setEditing(true);
          }}
          className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        >
          <Pencil className="size-3" />
        </button>
        <button onClick={onDelete} className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-red-400">
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}

function ShareButton({
  shareToken,
  onShare,
  onUnshare,
}: {
  shareToken: string | null;
  onShare: () => Promise<string | null>;
  onUnshare: () => Promise<boolean>;
}) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const shareUrl = shareToken ? `${window.location.origin}/shared/${shareToken}` : null;

  const handleShare = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    setLoading(true);
    const token = await onShare();
    if (token) {
      await navigator.clipboard.writeText(`${window.location.origin}/shared/${token}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            disabled={loading}
            className="size-8 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : copied ? (
              <Check className="size-4 text-emerald-400" />
            ) : shareUrl ? (
              <Copy className="size-4" />
            ) : (
              <Share2 className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copiado" : shareUrl ? "Copiar enlace" : "Compartir chat"}</TooltipContent>
      </Tooltip>
      {shareUrl && (
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                setLoading(true);
                await onUnshare();
                setLoading(false);
              }}
              className="size-8 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
            >
              <X className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Revocar enlace</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export function ChatInterface() {
  const {
    chats,
    loading: chatsLoading,
    createChat,
    deleteChat,
    renameChat,
    shareChat,
    unshareChat,
    updateLocalTitle,
  } = useChats();

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;
  const { messages, loading, historyLoading, sendMessage } = useChat(
    activeChatId,
    (id, title) => updateLocalTitle(id, title),
  );

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleNewChat = async () => {
    const chat = await createChat();
    if (chat) setActiveChatId(chat.id);
  };

  const handleDelete = async (chatId: string) => {
    await deleteChat(chatId);
    if (activeChatId === chatId) setActiveChatId(null);
  };

  const submit = async () => {
    const q = input.trim();
    if (!q || loading) return;
    let cid = activeChatId;
    if (!cid) {
      const chat = await createChat(q.slice(0, 60));
      if (!chat) return;
      cid = chat.id;
      setActiveChatId(cid);
    }
    setInput("");
    await sendMessage(q, "chat", undefined, cid);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex h-full bg-[#070706]">
      <aside className="flex w-72 shrink-0 flex-col border-r border-zinc-800/80 bg-[#0b0b0c] py-4">
        <div className="px-4">
          <Button
            onClick={handleNewChat}
            className="h-10 w-full justify-start gap-2 rounded-lg bg-amber-300 text-zinc-950 hover:bg-amber-200"
          >
            <MessageSquarePlus className="size-4" />
            Nueva conversacion
          </Button>
        </div>

        <div className="mt-5 px-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Conversaciones</p>
        </div>

        <ScrollArea className="mt-2 flex-1 px-3">
          {chatsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-zinc-800/45" />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="mx-1 rounded-lg border border-dashed border-zinc-800 p-4 text-center">
              <MessageSquare className="mx-auto size-5 text-zinc-600" />
              <p className="mt-2 text-xs text-zinc-600">Sin conversaciones</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  active={chat.id === activeChatId}
                  onSelect={() => setActiveChatId(chat.id)}
                  onDelete={() => handleDelete(chat.id)}
                  onRename={(title) => renameChat(chat.id, title)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#0b0b0c]/90 px-7 py-4 backdrop-blur">
          <div className="min-w-0">
            <h2 className="truncate font-heading text-xl font-semibold text-white">
              {activeChat?.title ?? "Chat documental"}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">Preguntas con contexto, citas y trazabilidad.</p>
          </div>
          {activeChat && (
            <ShareButton
              shareToken={activeChat.share_token}
              onShare={() => shareChat(activeChat.id)}
              onUnshare={() => unshareChat(activeChat.id)}
            />
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-7">
          {!historyLoading && messages.length === 0 && !loading && (
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-5 text-center">
              <div className="flex size-16 items-center justify-center rounded-lg border border-amber-400/25 bg-amber-400/10 shadow-[0_18px_48px_rgba(245,158,11,0.08)]">
                <Brain className="size-8 text-amber-300" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Listo para consultar documentos</p>
                <p className="mt-1 max-w-md text-sm leading-6 text-zinc-500">
                  Haz una pregunta y recibe una respuesta sustentada por tus archivos.
                </p>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-3">
                {promptIdeas.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left text-xs leading-5 text-zinc-400 transition-colors hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-zinc-100"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {historyLoading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-zinc-500" />
            </div>
          )}

          {!historyLoading && (messages.length > 0 || loading) && (
            <div className="mx-auto max-w-4xl space-y-6 py-6">
              {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-zinc-800/80 bg-[#0b0b0c]/90 px-6 pb-5 pt-3">
          <div className="mx-auto max-w-4xl">
            <div className="flex gap-2 rounded-lg border border-zinc-800 bg-zinc-950/80 p-2 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Escribe tu pregunta..."
                disabled={loading}
                className="h-11 flex-1 border-transparent bg-transparent text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0"
              />
              <Button
                onClick={submit}
                disabled={!input.trim() || loading}
                size="icon"
                className="size-11 shrink-0 bg-amber-300 text-zinc-950 hover:bg-amber-200"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>
            <p className="mt-2 px-1 text-[11px] text-zinc-600">
              Las respuestas pueden requerir verificacion cuando el documento fuente sea ambiguo.
            </p>
          </div>
        </footer>
      </section>
    </div>
  );
}
