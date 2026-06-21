"""Endpoint RAG. mode='chat' usa Groq; mode='search' devuelve chunks."""
import time
from typing import Optional

from fastapi import APIRouter, Header

from core import database
from models.schemas import ChatRequest, ChatResponse, Source
from services import llm_service, rag_pipeline

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, x_user_id: str = Header(default="")):
    start = time.perf_counter()
    chunks = rag_pipeline.retrieve(req.question, req.top_k, req.filter_doc, x_user_id or None)
    sources = [Source(**c) for c in chunks]

    if req.mode == "search":
        answer, used_llm = None, False
    else:
        answer, used_llm = llm_service.answer(req.question, chunks)

    latency_ms = int((time.perf_counter() - start) * 1000)
    database.insert_query(req.question, req.mode, used_llm, latency_ms, x_user_id)

    # Persist messages into a chat session if chat_id provided
    if req.chat_id:
        chat_obj = database.get_chat(req.chat_id, x_user_id or None)
        if chat_obj:
            database.add_message(req.chat_id, "user", req.question)
            sources_data = [s.model_dump() for s in sources]
            database.add_message(
                req.chat_id, "assistant", answer or _extractive_summary(chunks),
                sources=sources_data, used_llm=used_llm, latency_ms=latency_ms,
            )
            # Auto-title from first message
            if chat_obj["title"] == "Nueva conversación":
                title = req.question[:60].strip()
                database.update_chat_title(req.chat_id, x_user_id, title)

    return ChatResponse(
        mode=req.mode,
        answer=answer,
        sources=sources,
        latency_ms=latency_ms,
        used_llm=used_llm,
    )


def _extractive_summary(chunks: list[dict]) -> str:
    if not chunks:
        return "No encontré información relevante en tus documentos."
    return chunks[0]["text"][:500]
