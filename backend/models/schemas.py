"""Modelos Pydantic para request/response de la API."""
from typing import Literal, Optional

from pydantic import BaseModel


# ---------- Documents ----------
class UploadResponse(BaseModel):
    document_id: str
    filename: str
    source_type: str
    pages: int
    chunks: int
    ocr_confidence: Optional[float] = None


class DocumentItem(BaseModel):
    id: str
    filename: str
    source_type: str
    pages: int
    chunks: int
    status: str
    ocr_confidence: Optional[float] = None
    size_bytes: int
    uploaded_at: str


class DocumentsResponse(BaseModel):
    documents: list[DocumentItem]


# ---------- Chat / Search ----------
class ChatRequest(BaseModel):
    question: str
    mode: Literal["chat", "search"] = "chat"
    top_k: Optional[int] = None
    filter_doc: Optional[str] = None
    chat_id: Optional[str] = None


class Source(BaseModel):
    filename: str
    page: int
    text: str
    score: float
    source_type: Optional[str] = None


class ChatResponse(BaseModel):
    mode: str
    answer: Optional[str] = None
    sources: list[Source]
    latency_ms: int
    used_llm: bool


# ---------- Metrics ----------
class ActivityPoint(BaseModel):
    date: str
    count: int


class MetricsResponse(BaseModel):
    documents: int
    chunks: int
    queries: int
    storage_mb: float
    activity: list[ActivityPoint]
