"""Orquestación RAG: ingesta (extraer→limpiar→chunk→embed→indexar) y retrieval."""
import os
import re
from typing import Optional
from uuid import uuid4

from langchain_text_splitters import RecursiveCharacterTextSplitter

from core import database
from core.config import settings
from services import ocr_service, vector_store

_splitter = RecursiveCharacterTextSplitter(
    chunk_size=settings.chunk_size,
    chunk_overlap=settings.chunk_overlap,
    separators=["\n\n", "\n", ". ", " ", ""],
)


def _clean(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def ingest(path: str, filename: str, ext: str, user_id: str = "") -> dict:
    pages, source_type, ocr_conf = ocr_service.extract(path, ext)
    document_id = uuid4().hex[:12]

    ids, texts, metas = [], [], []
    total_chunks = 0
    for p in pages:
        clean = _clean(p["text"])
        if not clean:
            continue
        for idx, chunk in enumerate(_splitter.split_text(clean)):
            ids.append(f"{document_id}-{p['page']}-{idx}")
            texts.append(chunk)
            metas.append({
                "filename": filename,
                "page": p["page"],
                "chunk_index": idx,
                "source_type": source_type,
                "document_id": document_id,
                "user_id": user_id,
            })
            total_chunks += 1

    if texts:
        vector_store.add_chunks(ids, texts, metas)

    size_bytes = os.path.getsize(path) if os.path.exists(path) else 0
    database.insert_document(
        document_id, filename, source_type, len(pages), total_chunks,
        "indexed", ocr_conf, size_bytes, user_id,
    )
    return {
        "document_id": document_id,
        "filename": filename,
        "source_type": source_type,
        "pages": len(pages),
        "chunks": total_chunks,
        "ocr_confidence": ocr_conf,
    }


def retrieve(question: str, top_k: Optional[int] = None,
             filter_doc: Optional[str] = None,
             user_id: Optional[str] = None) -> list[dict]:
    return vector_store.query(
        question,
        top_k or settings.top_k_retrieval,
        filter_doc,
        user_id,
    )
