"""Endpoint 3: chat RAG. mode='chat' usa Groq; mode='search' devuelve chunks.
Sin Groq (o ante error) responde en modo extractivo."""
import time

from fastapi import APIRouter

from core import database
from models.schemas import ChatRequest, ChatResponse, Source
from services import llm_service, rag_pipeline

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    start = time.perf_counter()
    chunks = rag_pipeline.retrieve(req.question, req.top_k, req.filter_doc)
    sources = [Source(**c) for c in chunks]

    if req.mode == "search":
        answer, used_llm = None, False
    else:
        answer, used_llm = llm_service.answer(req.question, chunks)

    latency_ms = int((time.perf_counter() - start) * 1000)
    database.insert_query(req.question, req.mode, used_llm, latency_ms)

    return ChatResponse(
        mode=req.mode,
        answer=answer,
        sources=sources,
        latency_ms=latency_ms,
        used_llm=used_llm,
    )
