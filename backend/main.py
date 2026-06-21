"""DocuMind AI — FastAPI entrypoint.

4 endpoints funcionales:
  POST /documents/upload   - subir + indexar (RAG + OCR)
  GET  /documents          - listar documentos
  POST /chat               - RAG (mode chat|search) + fallback extractivo
  GET  /metrics            - métricas del dashboard
GET / es un health check utilitario (no cuenta como endpoint).
"""
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import chat, documents, metrics
from core.database import init_db, count_documents

logger = logging.getLogger("documind")

app = FastAPI(title="DocuMind AI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _seed_demo() -> None:
    """Indexa los 7 documentos demo si la base está vacía. Idempotente."""
    if count_documents() > 0:
        return

    try:
        from scripts.generate_demo_docs import generate_all, DEMO_DIR
        from services.rag_pipeline import ingest

        logger.info("Base vacía — generando documentos demo ...")
        generate_all()

        ext_map = {".pdf": ".pdf", ".jpg": ".jpg", ".png": ".png"}
        loaded = 0
        for fname in sorted(os.listdir(DEMO_DIR)):
            ext = os.path.splitext(fname)[1].lower()
            if ext not in ext_map:
                continue
            path = os.path.join(DEMO_DIR, fname)
            try:
                result = ingest(path, fname, ext)
                logger.info("  Seed: %s → %d chunks", fname, result["chunks"])
                loaded += 1
            except Exception as exc:
                logger.error("  Seed error en %s: %s", fname, exc)

        logger.info("Seed completo: %d documentos demo cargados.", loaded)
    except Exception as exc:
        logger.error("Seed demo falló (la app sigue funcionando): %s", exc)


@app.on_event("startup")
def _startup() -> None:
    init_db()


@app.get("/")
def health():
    return {"status": "ok", "service": "DocuMind AI"}


app.include_router(documents.router, tags=["documents"])
app.include_router(chat.router, tags=["chat"])
app.include_router(metrics.router, tags=["metrics"])
