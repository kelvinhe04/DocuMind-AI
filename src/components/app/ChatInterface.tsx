"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Loader2, Zap, Brain, User, Share2, Check, Copy,
  MessageSquarePlus, Trash2, Pencil, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SourceCitations } from "./SourceCitations";
import { useChat } from "@/hooks/useChat";
import { useChats } from "@/hooks/useChats";
import { cn } from "@/lib/utils";
import type { ChatMessage, ChatSession } from "@/types/chat";

/* ── Avatars ─────────────────────────────────────────────────────────────── */
function BotAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-600">
      <Brain className="size-4 text-white" />
    </div>
  );
}
function UserAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-600">
      <User className="size-4 text-white" />
    </div>
  );
}

/* ── Typing indicator ────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <BotAvatar />
      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
      </div>
    </div>
  );
}

/* ── Message bubble ──────────────────────────────────────────────────────── */
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[75%]">
          <div className="rounded-2xl bg-violet-600 px-4 py-3 text-sm leading-relaxed text-white">
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        </div>
        <UserAvatar />
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <BotAvatar />
      <div className="max-w-[75%] space-y-1.5">
        <div className="rounded-2xl bg-muted px-4 py-3 text-sm leading-relaxed">
          <div className="whitespace-pre-wrap">{msg.content}</div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {msg.used_llm === false && (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-amber-600 border-amber-500/40 cursor-help">
                  <Zap className="size-2.5 mr-1" />Extractivo
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs max-w-48">
                Groq no disponible — respuesta basada en fragmentos sin LLM.
              </TooltipContent>
            </Tooltip>
          )}
          {msg.used_llm === true && (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-violet-600 border-violet-500/40 cursor-help">
                  <Brain className="size-2.5 mr-1" />Groq
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Respuesta generada con llama-3.1-8b-instant vía Groq.
              </TooltipContent>
            </Tooltip>
          )}
          {msg.latency_ms != null && (
            <span className="text-[10px] text-muted-foreground/60">{(msg.latency_ms / 1000).toFixed(2)}s</span>
          )}
        </div>
        {msg.sources && msg.sources.length > 0 && <SourceCitations sources={msg.sources} />}
      </div>
    </div>
  );
}

/* ── Chat list item ──────────────────────────────────────────────────────── */
function ChatListItem({
  chat, active, onSelect, onDelete, onRename,
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

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== chat.title) onRename(trimmed);
    setEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-violet-600/20 text-white"
          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
      )}
    >
      {editing ? (
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none text-white text-sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") { setDraft(chat.title); setEditing(false); }
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 truncate">{chat.title}</span>
      )}

      <div
        className="hidden shrink-0 items-center gap-0.5 group-hover:flex"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => { setDraft(chat.title); setEditing(true); }}
          className="rounded p-1 hover:bg-slate-700 text-slate-500 hover:text-slate-300"
        >
          <Pencil className="size-3" />
        </button>
        <button
          onClick={onDelete}
          className="rounded p-1 hover:bg-slate-700 text-slate-500 hover:text-red-400"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}

/* ── Share button ────────────────────────────────────────────────────────── */
function ShareButton({ chatId, shareToken, onShare, onUnshare }: {
  chatId: string;
  shareToken: string | null;
  onShare: () => Promise<string | null>;
  onUnshare: () => Promise<boolean>;
}) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const shareUrl = shareToken
    ? `${window.location.origin}/shared/${shareToken}`
    : null;

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
      const url = `${window.location.origin}/shared/${token}`;
      await navigator.clipboard.writeText(url);
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
            className="size-8 text-muted-foreground hover:text-foreground"
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
        <TooltipContent>
          {copied ? "¡Copiado!" : shareUrl ? "Copiar enlace" : "Compartir chat"}
        </TooltipContent>
      </Tooltip>
      {shareUrl && (
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => { setLoading(true); await onUnshare(); setLoading(false); }}
              className="size-8 text-muted-foreground hover:text-red-400"
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

/* ── Main component ──────────────────────────────────────────────────────── */
export function ChatInterface() {
  const {
    chats, loading: chatsLoading,
    createChat, deleteChat, renameChat, shareChat, unshareChat, updateLocalTitle,
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
    // Create chat on first message if none selected
    let cid = activeChatId;
    if (!cid) {
      const chat = await createChat(q.slice(0, 60));
      if (!chat) return;
      cid = chat.id;
      setActiveChatId(cid);
    }
    setInput("");
    await sendMessage(q, "chat");
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className="flex h-full gap-0">
      {/* Sidebar */}
      <div className="flex w-56 shrink-0 flex-col border-r border-slate-800/60 bg-slate-900/40 py-4">
        <div className="px-3 mb-3">
          <Button
            onClick={handleNewChat}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <MessageSquarePlus className="size-3.5" />
            Nuevo chat
          </Button>
        </div>

        <div className="px-2 mb-1">
          <p className="px-1 text-[10px] font-medium uppercase tracking-wider text-slate-600">
            Conversaciones
          </p>
        </div>

        <ScrollArea className="flex-1 px-2">
          {chatsLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-9 rounded-xl bg-slate-800/40 animate-pulse" />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <p className="px-3 py-4 text-xs text-slate-600 text-center">Sin conversaciones aún</p>
          ) : (
            <div className="space-y-0.5">
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
      </div>

      {/* Chat area */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">

        {/* Header — fixed top */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
          <div>
            <h2 className="font-heading text-2xl font-semibold truncate max-w-lg">
              {activeChat?.title ?? "Chat"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pregunta sobre tus documentos — las respuestas incluyen citas de fuente.
            </p>
          </div>
          {activeChat && (
            <ShareButton
              chatId={activeChat.id}
              shareToken={activeChat.share_token}
              onShare={() => shareChat(activeChat.id)}
              onUnshare={() => unshareChat(activeChat.id)}
            />
          )}
        </div>

        {/* Messages — scrollable middle */}
        <div className="flex-1 overflow-y-auto px-6">

          {/* Empty state */}
          {!historyLoading && messages.length === 0 && !loading && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center select-none">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-violet-600/15 border border-violet-500/20">
                <Brain className="size-8 text-violet-400" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">¿Qué quieres saber?</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Sube documentos y empieza a preguntar. Las respuestas incluyen citas de fuente exactas.
                </p>
              </div>
            </div>
          )}

          {/* History loading */}
          {historyLoading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-slate-500" />
            </div>
          )}

          {/* Messages list */}
          {!historyLoading && (messages.length > 0 || loading) && (
            <div className="space-y-6 py-4">
              {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input — fixed bottom */}
        <div className="px-6 pb-5 pt-3 shrink-0 border-t border-slate-800/60">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Escribe tu pregunta…"
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={submit}
              disabled={!input.trim() || loading}
              size="icon"
              className="bg-violet-600 hover:bg-violet-700 shrink-0"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
