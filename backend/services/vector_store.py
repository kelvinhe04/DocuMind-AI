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


def query(text: str, k: int, filter_doc: Optional[str] = None) -> list[dict]:
    where = {"filename": filter_doc} if filter_doc else None
    res = _collection.query(query_texts=[text], n_results=k, where=where)
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


def count_chunks() -> int:
    return _collection.count()
