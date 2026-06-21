"""SQLite: metadata de documentos y registro de consultas (para métricas)."""
import os
import sqlite3
from datetime import datetime, timezone

from core.config import settings


def _conn() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(settings.sqlite_db_path) or ".", exist_ok=True)
    conn = sqlite3.connect(settings.sqlite_db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _conn() as c:
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                source_type TEXT NOT NULL,
                pages INTEGER NOT NULL,
                chunks INTEGER NOT NULL,
                status TEXT NOT NULL,
                ocr_confidence REAL,
                size_bytes INTEGER NOT NULL DEFAULT 0,
                uploaded_at TEXT NOT NULL
            )
            """
        )
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS queries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                mode TEXT NOT NULL,
                used_llm INTEGER NOT NULL,
                latency_ms INTEGER NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


def insert_document(doc_id, filename, source_type, pages, chunks, status,
                    ocr_confidence, size_bytes) -> None:
    with _conn() as c:
        c.execute(
            """INSERT OR REPLACE INTO documents
               (id, filename, source_type, pages, chunks, status,
                ocr_confidence, size_bytes, uploaded_at)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (doc_id, filename, source_type, pages, chunks, status,
             ocr_confidence, size_bytes, datetime.now(timezone.utc).isoformat()),
        )


def list_documents() -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT * FROM documents ORDER BY uploaded_at DESC"
        ).fetchall()
    return [dict(r) for r in rows]


def count_documents() -> int:
    with _conn() as c:
        return c.execute("SELECT COUNT(*) FROM documents").fetchone()[0]


def insert_query(question, mode, used_llm, latency_ms) -> None:
    with _conn() as c:
        c.execute(
            """INSERT INTO queries (question, mode, used_llm, latency_ms, created_at)
               VALUES (?,?,?,?,?)""",
            (question, mode, int(used_llm), latency_ms,
             datetime.now(timezone.utc).isoformat()),
        )


def metrics_summary() -> dict:
    with _conn() as c:
        documents = c.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
        queries = c.execute("SELECT COUNT(*) FROM queries").fetchone()[0]
        storage = c.execute("SELECT COALESCE(SUM(size_bytes),0) FROM documents").fetchone()[0]
        rows = c.execute(
            """SELECT substr(created_at,1,10) AS date, COUNT(*) AS count
               FROM queries GROUP BY date ORDER BY date DESC LIMIT 7"""
        ).fetchall()
    activity = [{"date": r["date"], "count": r["count"]} for r in reversed(rows)]
    return {
        "documents": documents,
        "queries": queries,
        "storage_mb": round(storage / 1_000_000, 2),
        "activity": activity,
    }
