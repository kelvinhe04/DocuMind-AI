"""SQLite: metadata de documentos, queries (métricas), chats y mensajes."""
import json
import os
import sqlite3
from datetime import datetime, timezone
from uuid import uuid4

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
                user_id TEXT NOT NULL DEFAULT '',
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
        # Migration: add user_id column to existing tables if missing
        try:
            c.execute("ALTER TABLE documents ADD COLUMN user_id TEXT NOT NULL DEFAULT ''")
        except Exception:
            pass

        c.execute(
            """
            CREATE TABLE IF NOT EXISTS queries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL DEFAULT '',
                question TEXT NOT NULL,
                mode TEXT NOT NULL,
                used_llm INTEGER NOT NULL,
                latency_ms INTEGER NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        try:
            c.execute("ALTER TABLE queries ADD COLUMN user_id TEXT NOT NULL DEFAULT ''")
        except Exception:
            pass

        c.execute(
            """
            CREATE TABLE IF NOT EXISTS chats (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL DEFAULT 'Nueva conversación',
                share_token TEXT UNIQUE,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                sources TEXT,
                used_llm INTEGER,
                latency_ms INTEGER,
                created_at TEXT NOT NULL
            )
            """
        )
        c.execute("CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id)")
        c.execute("CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id)")
        c.execute("PRAGMA foreign_keys = ON")


# ── Documents ─────────────────────────────────────────────────────────────────

def insert_document(doc_id, filename, source_type, pages, chunks, status,
                    ocr_confidence, size_bytes, user_id: str = "") -> None:
    with _conn() as c:
        c.execute(
            """INSERT OR REPLACE INTO documents
               (id, user_id, filename, source_type, pages, chunks, status,
                ocr_confidence, size_bytes, uploaded_at)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (doc_id, user_id, filename, source_type, pages, chunks, status,
             ocr_confidence, size_bytes, datetime.now(timezone.utc).isoformat()),
        )


def get_document(doc_id: str, user_id: str = "") -> dict | None:
    with _conn() as c:
        if user_id:
            row = c.execute(
                "SELECT * FROM documents WHERE id = ? AND (user_id = ? OR user_id = '')",
                (doc_id, user_id),
            ).fetchone()
        else:
            row = c.execute(
                "SELECT * FROM documents WHERE id = ?", (doc_id,)
            ).fetchone()
    return dict(row) if row else None


def filename_exists(filename: str, user_id: str = "") -> bool:
    with _conn() as c:
        if user_id:
            return c.execute(
                "SELECT 1 FROM documents WHERE filename = ? AND (user_id = ? OR user_id = '')",
                (filename, user_id),
            ).fetchone() is not None
        return c.execute(
            "SELECT 1 FROM documents WHERE filename = ?", (filename,)
        ).fetchone() is not None


def list_documents(user_id: str = "") -> list[dict]:
    with _conn() as c:
        if user_id:
            # Include legacy docs (user_id='') uploaded before per-user isolation was added
            rows = c.execute(
                "SELECT * FROM documents WHERE user_id = ? OR user_id = '' ORDER BY uploaded_at DESC",
                (user_id,),
            ).fetchall()
        else:
            rows = c.execute(
                "SELECT * FROM documents ORDER BY uploaded_at DESC"
            ).fetchall()
    return [dict(r) for r in rows]


def delete_document(doc_id: str, user_id: str = "") -> bool:
    with _conn() as c:
        if user_id:
            cur = c.execute(
                "DELETE FROM documents WHERE id = ? AND (user_id = ? OR user_id = '')",
                (doc_id, user_id),
            )
        else:
            cur = c.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    return cur.rowcount > 0


def count_documents(user_id: str = "") -> int:
    with _conn() as c:
        if user_id:
            return c.execute(
                "SELECT COUNT(*) FROM documents WHERE user_id = ? OR user_id = ''", (user_id,)
            ).fetchone()[0]
        return c.execute("SELECT COUNT(*) FROM documents").fetchone()[0]


# ── Queries ───────────────────────────────────────────────────────────────────

def insert_query(question, mode, used_llm, latency_ms, user_id: str = "") -> None:
    with _conn() as c:
        c.execute(
            """INSERT INTO queries (user_id, question, mode, used_llm, latency_ms, created_at)
               VALUES (?,?,?,?,?,?)""",
            (user_id, question, mode, int(used_llm), latency_ms,
             datetime.now(timezone.utc).isoformat()),
        )


# ── Metrics ───────────────────────────────────────────────────────────────────

def metrics_summary(user_id: str = "") -> dict:
    with _conn() as c:
        if user_id:
            documents = c.execute(
                "SELECT COUNT(*) FROM documents WHERE user_id = ? OR user_id = ''", (user_id,)
            ).fetchone()[0]
            queries = c.execute(
                "SELECT COUNT(*) FROM queries WHERE user_id = ?", (user_id,)
            ).fetchone()[0]
            storage = c.execute(
                "SELECT COALESCE(SUM(size_bytes),0) FROM documents WHERE user_id = ? OR user_id = ''",
                (user_id,),
            ).fetchone()[0]
            rows = c.execute(
                """SELECT substr(created_at,1,10) AS date, COUNT(*) AS count
                   FROM queries WHERE user_id = ?
                   GROUP BY date ORDER BY date DESC LIMIT 7""",
                (user_id,),
            ).fetchall()
        else:
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


# ── Chats ─────────────────────────────────────────────────────────────────────

def create_chat(user_id: str, title: str = "Nueva conversación") -> dict:
    chat_id = uuid4().hex
    now = datetime.now(timezone.utc).isoformat()
    with _conn() as c:
        c.execute(
            "INSERT INTO chats (id, user_id, title, created_at, updated_at) VALUES (?,?,?,?,?)",
            (chat_id, user_id, title, now, now),
        )
    return {"id": chat_id, "user_id": user_id, "title": title,
            "share_token": None, "created_at": now, "updated_at": now}


def list_chats(user_id: str) -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC", (user_id,)
        ).fetchall()
    return [dict(r) for r in rows]


def get_chat(chat_id: str, user_id: str | None = None) -> dict | None:
    with _conn() as c:
        if user_id:
            row = c.execute(
                "SELECT * FROM chats WHERE id = ? AND user_id = ?", (chat_id, user_id)
            ).fetchone()
        else:
            row = c.execute("SELECT * FROM chats WHERE id = ?", (chat_id,)).fetchone()
    return dict(row) if row else None


def get_chat_by_share_token(token: str) -> dict | None:
    with _conn() as c:
        row = c.execute(
            "SELECT * FROM chats WHERE share_token = ?", (token,)
        ).fetchone()
    return dict(row) if row else None


def update_chat_title(chat_id: str, user_id: str, title: str) -> bool:
    now = datetime.now(timezone.utc).isoformat()
    with _conn() as c:
        cur = c.execute(
            "UPDATE chats SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            (title, now, chat_id, user_id),
        )
    return cur.rowcount > 0


def touch_chat(chat_id: str) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with _conn() as c:
        c.execute("UPDATE chats SET updated_at = ? WHERE id = ?", (now, chat_id))


def delete_chat(chat_id: str, user_id: str) -> bool:
    with _conn() as c:
        c.execute("PRAGMA foreign_keys = ON")
        cur = c.execute(
            "DELETE FROM chats WHERE id = ? AND user_id = ?", (chat_id, user_id)
        )
    return cur.rowcount > 0


def set_share_token(chat_id: str, user_id: str) -> str | None:
    token = uuid4().hex
    with _conn() as c:
        cur = c.execute(
            "UPDATE chats SET share_token = ? WHERE id = ? AND user_id = ?",
            (token, chat_id, user_id),
        )
    return token if cur.rowcount > 0 else None


def revoke_share_token(chat_id: str, user_id: str) -> bool:
    with _conn() as c:
        cur = c.execute(
            "UPDATE chats SET share_token = NULL WHERE id = ? AND user_id = ?",
            (chat_id, user_id),
        )
    return cur.rowcount > 0


# ── Messages ──────────────────────────────────────────────────────────────────

def add_message(chat_id: str, role: str, content: str,
                sources=None, used_llm=None, latency_ms=None) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    sources_json = json.dumps(sources) if sources is not None else None
    with _conn() as c:
        cur = c.execute(
            """INSERT INTO messages (chat_id, role, content, sources, used_llm, latency_ms, created_at)
               VALUES (?,?,?,?,?,?,?)""",
            (chat_id, role, content, sources_json,
             int(used_llm) if used_llm is not None else None, latency_ms, now),
        )
        msg_id = cur.lastrowid
    touch_chat(chat_id)
    return {
        "id": msg_id, "chat_id": chat_id, "role": role, "content": content,
        "sources": sources, "used_llm": used_llm, "latency_ms": latency_ms, "created_at": now,
    }


def get_recent_messages(chat_id: str, limit: int = 6) -> list[dict]:
    """Return last `limit` messages (role + content only) for LLM conversation context."""
    with _conn() as c:
        rows = c.execute(
            "SELECT role, content FROM messages WHERE chat_id = ? ORDER BY id DESC LIMIT ?",
            (chat_id, limit),
        ).fetchall()
    return [{"role": r["role"], "content": r["content"]} for r in reversed(rows)]


def list_messages(chat_id: str) -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT * FROM messages WHERE chat_id = ? ORDER BY id ASC", (chat_id,)
        ).fetchall()
    result = []
    for r in rows:
        d = dict(r)
        if d.get("sources"):
            try:
                d["sources"] = json.loads(d["sources"])
            except Exception:
                d["sources"] = []
        if d.get("used_llm") is not None:
            d["used_llm"] = bool(d["used_llm"])
        result.append(d)
    return result
