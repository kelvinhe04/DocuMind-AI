"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Zap, Brain, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SourceCitations } from "./SourceCitations";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";


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

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-3">
        <div className="max-w-[75%]">
          <div className="rounded-2xl rounded-br-sm bg-violet-600 px-4 py-3 text-sm leading-relaxed text-white">
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        </div>
        <UserAvatar />
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3">
      <BotAvatar />
      <div className="max-w-[75%] space-y-1.5">
        <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm leading-relaxed">
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
                Groq no disponible — respuesta basada en los fragmentos más relevantes sin LLM.
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
            <span className="text-[10px] text-muted-foreground/60">{msg.latency_ms}ms</span>
          )}
        </div>

        {msg.sources && msg.sources.length > 0 && (
          <SourceCitations sources={msg.sources} />
        )}
      </div>
    </div>
  );
}

export function ChatInterface() {
  const { messages, loading, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submit = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    await sendMessage(q, "chat");
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold">Chat</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Pregunta sobre tus documentos — las respuestas incluyen citas de fuente.</p>
        </div>
        {messages.length > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" onClick={clearMessages} className="size-8 text-muted-foreground hover:text-foreground">
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Limpiar conversación</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Empty state */}
      {messages.length === 0 && !loading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center select-none">
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

      {/* Messages */}
      {messages.length > 0 && (
        <ScrollArea className="flex-1 -mx-1 px-1">
          <div className="space-y-4 pb-2">
            {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      )}

      {/* Input */}
      <div className="flex gap-2 border-t pt-4">
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
  );
}
