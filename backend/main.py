"""DocuMind AI — FastAPI entrypoint.

4 endpoints funcionales:
  POST /documents/upload   - subir + indexar (RAG + OCR)
  GET  /documents          - listar documentos
  POST /chat               - RAG (mode chat|search) + fallback extractivo
  GET  /metrics            - métricas del dashboard
GET / es un health check utilitario (no cuenta como endpoint).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import chat, documents, metrics
from core.database import init_db

app = FastAPI(title="DocuMind AI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    init_db()
    # El seed de documentos demo se agrega en la Fase 7.


@app.get("/")
def health():
    return {"status": "ok", "service": "DocuMind AI"}


app.include_router(documents.router, tags=["documents"])
app.include_router(chat.router, tags=["chat"])
app.include_router(metrics.router, tags=["metrics"])
