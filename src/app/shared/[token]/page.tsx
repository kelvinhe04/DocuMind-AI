import { Brain, User, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FASTAPI = process.env.FASTAPI_URL ?? "http://localhost:8000";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  used_llm?: boolean;
  latency_ms?: number;
  created_at: string;
}

interface SharedChat {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
}

async function getSharedChat(token: string): Promise<SharedChat | null> {
  try {
    const res = await fetch(`${FASTAPI}/shared/${token}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SharedChatPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const chat = await getSharedChat(token);

  if (!chat) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-xl font-semibold text-white">Enlace inválido</p>
          <p className="mt-1 text-sm text-slate-500">Este chat no existe o el enlace fue revocado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-violet-600">
            <Brain className="size-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">{chat.title}</p>
            <p className="text-xs text-slate-500">
              DocuMind AI · Compartido ·{" "}
              {new Date(chat.created_at).toLocaleDateString("es-PA", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {chat.messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
              <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-slate-600" : "bg-violet-600"}`}>
                {isUser ? <User className="size-4 text-white" /> : <Brain className="size-4 text-white" />}
              </div>
              <div className={`max-w-[75%] space-y-1.5 ${isUser ? "items-end" : ""}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "bg-violet-600 text-white rounded-tr-sm" : "bg-slate-800 text-slate-100 rounded-tl-sm"}`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                {!isUser && (
                  <div className="flex items-center gap-1.5">
                    {msg.used_llm === false && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-cyan-400 border-cyan-500/40">
                        <Zap className="size-2.5 mr-1" />Extractivo
                      </Badge>
                    )}
                    {msg.used_llm === true && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-violet-400 border-violet-500/40">
                        <Brain className="size-2.5 mr-1" />Groq
                      </Badge>
                    )}
                    {msg.latency_ms != null && (
                      <span className="text-[10px] text-slate-600">{(msg.latency_ms / 1000).toFixed(2)}s</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {chat.messages.length === 0 && (
          <p className="text-center text-sm text-slate-600">Esta conversación está vacía.</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-6 text-center">
        <p className="text-xs text-slate-600">
          Generado por{" "}
          <span className="text-violet-400 font-medium">DocuMind AI</span>
          {" "}· Vista de solo lectura
        </p>
      </div>
    </div>
  );
}
