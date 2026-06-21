"""Wrapper de ChromaDB. Embeddings: all-MiniLM-L6-v2 (ONNX, default de Chroma)."""
from typing import Optional

import chromadb
from chromadb.utils import embedding_functions

from core.config import settings

_client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
_ef = embedding_functions.DefaultEmbeddingFunction()  # all-MiniLM-L6-v2 ONNX
_collection = _client.get_or_create_collection(
    name="documind_documents", embedding_function=_ef
)


def add_chunks(ids: list[str], texts: list[str], metadatas: list[dict]) -> None:
    _collection.add(ids=ids, documents=texts, metadatas=metadatas)


def delete_chunks_by_document(document_id: str) -> None:
    _collection.delete(where={"document_id": document_id})


def _format_results(res: dict) -> list[dict]:
    docs = res.get("documents", [[]])[0]
    metas = res.get("metadatas", [[]])[0]
    dists = res.get("distances", [[]])[0]
    out: list[dict] = []
    for txt, meta, dist in zip(docs, metas, dists):
        out.append({
            "text": txt,
            "filename": meta.get("filename", "?"),
            "page": int(meta.get("page", 0)),
            "source_type": meta.get("source_type"),
            "score": round(1 - float(dist), 3),
        })
    return out


def query(text: str, k: int, filter_doc: Optional[str] = None,
          user_id: Optional[str] = None) -> list[dict]:
    # Build where clause. Legacy chunks (indexed before user_id) have no user_id
    # in their metadata, so we use $in to match both the user's chunks and legacy ones.
    conditions: list[dict] = []
    if user_id:
        conditions.append({"user_id": {"$in": [user_id, ""]}})
    if filter_doc:
        conditions.append({"filename": filter_doc})

    if len(conditions) == 0:
        where = None
    elif len(conditions) == 1:
        where = conditions[0]
    else:
        where = {"$and": conditions}

    try:
        res = _collection.query(query_texts=[text], n_results=k, where=where)
        results = _format_results(res)
    except Exception:
        results = []

    # Fallback: if user_id filter found nothing, search without it (covers chunks
    # indexed before the user_id field existed, which have no user_id key at all).
    if not results and user_id:
        where_fallback = {"filename": filter_doc} if filter_doc else None
        try:
            res = _collection.query(query_texts=[text], n_results=k, where=where_fallback)
            results = _format_results(res)
        except Exception:
            pass

    return results


def count_chunks(user_id: Optional[str] = None) -> int:
    if not user_id:
        return _collection.count()
    try:
        # Include user's chunks and legacy chunks (user_id="") that predate isolation
        res = _collection.get(where={"user_id": {"$in": [user_id, ""]}})
        count = len(res.get("ids", []))
        if count > 0:
            return count
        # Fallback: chunks without user_id key at all (very old data)
        return _collection.count()
    except Exception:
        return _collection.count()
