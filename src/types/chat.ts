export interface Source {
  filename: string;
  page: number;
  text: string;
  score: number;
  source_type?: string;
}

export interface ChatResponse {
  mode: "chat" | "search";
  answer?: string;
  sources: Source[];
  latency_ms: number;
  used_llm: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  used_llm?: boolean;
  latency_ms?: number;
  timestamp: Date;
}
