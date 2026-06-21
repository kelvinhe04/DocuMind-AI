"""CRUD de sesiones de chat y mensajes persistidos."""
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional

from core import database

router = APIRouter()


class CreateChatBody(BaseModel):
    title: Optional[str] = "Nueva conversación"


class RenameChatBody(BaseModel):
    title: str


# ── Chat sessions ─────────────────────────────────────────────────────────────

@router.get("/chats")
def list_chats(x_user_id: str = Header(default="")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="x-user-id header required")
    return {"chats": database.list_chats(x_user_id)}


@router.post("/chats", status_code=201)
def create_chat(body: CreateChatBody, x_user_id: str = Header(default="")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="x-user-id header required")
    chat = database.create_chat(x_user_id, body.title or "Nueva conversación")
    return chat


@router.get("/chats/{chat_id}")
def get_chat(chat_id: str, x_user_id: str = Header(default="")):
    chat = database.get_chat(chat_id, x_user_id or None)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat no encontrado.")
    messages = database.list_messages(chat_id)
    return {**chat, "messages": messages}


@router.patch("/chats/{chat_id}")
def rename_chat(chat_id: str, body: RenameChatBody, x_user_id: str = Header(default="")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="x-user-id header required")
    ok = database.update_chat_title(chat_id, x_user_id, body.title.strip() or "Sin título")
    if not ok:
        raise HTTPException(status_code=404, detail="Chat no encontrado.")
    return {"ok": True}


@router.delete("/chats/{chat_id}")
def delete_chat(chat_id: str, x_user_id: str = Header(default="")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="x-user-id header required")
    ok = database.delete_chat(chat_id, x_user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Chat no encontrado.")
    return {"ok": True}


# ── Messages ──────────────────────────────────────────────────────────────────

@router.get("/chats/{chat_id}/messages")
def get_messages(chat_id: str, x_user_id: str = Header(default="")):
    chat = database.get_chat(chat_id, x_user_id or None)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat no encontrado.")
    return {"messages": database.list_messages(chat_id)}


# ── Share ─────────────────────────────────────────────────────────────────────

@router.post("/chats/{chat_id}/share")
def share_chat(chat_id: str, x_user_id: str = Header(default="")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="x-user-id header required")
    chat = database.get_chat(chat_id, x_user_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat no encontrado.")
    # Return existing token if already shared
    if chat["share_token"]:
        return {"share_token": chat["share_token"]}
    token = database.set_share_token(chat_id, x_user_id)
    if not token:
        raise HTTPException(status_code=500, detail="No se pudo generar el enlace.")
    return {"share_token": token}


@router.delete("/chats/{chat_id}/share")
def unshare_chat(chat_id: str, x_user_id: str = Header(default="")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="x-user-id header required")
    database.revoke_share_token(chat_id, x_user_id)
    return {"ok": True}


# ── Public shared chat ────────────────────────────────────────────────────────

@router.get("/shared/{token}")
def get_shared_chat(token: str):
    chat = database.get_chat_by_share_token(token)
    if not chat:
        raise HTTPException(status_code=404, detail="Enlace inválido o revocado.")
    messages = database.list_messages(chat["id"])
    # Don't expose user_id in public endpoint
    return {
        "id": chat["id"],
        "title": chat["title"],
        "created_at": chat["created_at"],
        "messages": messages,
    }
