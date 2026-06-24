"""Orquestación RAG: ingesta (extraer→limpiar→chunk→embed→indexar) y retrieval híbrido."""
import os
import re
from typing import Optional
from uuid import uuid4

from langchain_text_splitters import RecursiveCharacterTextSplitter
from rank_bm25 import BM25Okapi

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


# ── Hybrid retrieval ──────────────────────────────────────────────────────────

def _tokenize(text: str) -> list[str]:
    """Simple Spanish-friendly tokenizer: lowercase + split on non-alphanumeric."""
    return re.findall(r"[a-záéíóúüñ\w]+", text.lower())


def _bm25_search(question: str, all_chunks: list[dict], k: int) -> list[dict]:
    if not all_chunks:
        return []
    tokenized = [_tokenize(c["text"]) for c in all_chunks]
    bm25 = BM25Okapi(tokenized)
    scores = bm25.get_scores(_tokenize(question))
    top_idx = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]
    results = []
    for idx in top_idx:
        if scores[idx] > 0:
            chunk = all_chunks[idx].copy()
            chunk["score"] = float(scores[idx])
            results.append(chunk)
    return results


def _rrf_merge(vector_hits: list[dict], bm25_hits: list[dict],
               top_k: int, k_rrf: int = 60) -> list[dict]:
    """Reciprocal Rank Fusion: combine two ranked lists into one."""
    rrf: dict[str, float] = {}
    store: dict[str, dict] = {}

    def _key(item: dict) -> str:
        return item.get("_id") or f"{item['filename']}|{item['page']}|{item['text'][:80]}"

    for rank, item in enumerate(vector_hits):
        k = _key(item)
        rrf[k] = rrf.get(k, 0.0) + 1.0 / (k_rrf + rank + 1)
        store[k] = item

    for rank, item in enumerate(bm25_hits):
        k = _key(item)
        rrf[k] = rrf.get(k, 0.0) + 1.0 / (k_rrf + rank + 1)
        if k not in store:
            store[k] = item

    ranked = sorted(rrf.items(), key=lambda x: x[1], reverse=True)

    # Diversity: max 2 chunks per document to prevent large PDFs from dominating
    per_doc: dict[str, int] = {}
    diverse: list[tuple[str, float]] = []
    for key, score in ranked:
        doc_name = store[key].get("filename", "")
        count = per_doc.get(doc_name, 0)
        if count < 2:
            diverse.append((key, score))
            per_doc[doc_name] = count + 1
        if len(diverse) == top_k:
            break

    # Normalize relative to the best actual score so the top result = 1.0
    best = diverse[0][1] if diverse else 1.0

    merged = []
    for key, raw_score in diverse:
        item = store[key].copy()
        item.pop("_id", None)
        item["score"] = round(raw_score / best, 3)
        merged.append(item)
    return merged


def retrieve(question: str, top_k: Optional[int] = None,
             filter_doc: Optional[str] = None,
             user_id: Optional[str] = None) -> list[dict]:
    k = top_k or settings.top_k_retrieval

    # 1. Dense (vector) search
    vector_hits = vector_store.query(question, k, filter_doc, user_id)

    # 2. Sparse (BM25) search over the same user's corpus
    all_chunks = vector_store.get_all_chunks(user_id, filter_doc)
    bm25_hits = _bm25_search(question, all_chunks, k)

    # 3. Fuse with Reciprocal Rank Fusion
    return _rrf_merge(vector_hits, bm25_hits, top_k=k)
