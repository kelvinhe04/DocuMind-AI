"""Endpoints 1 y 2: subir/indexar documento y listar documentos."""
import os
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from core import database
from core.config import settings
from models.schemas import DocumentsResponse, UploadResponse
from services import rag_pipeline

router = APIRouter()

ALLOWED_EXT = {".pdf", ".jpg", ".jpeg", ".png"}


@router.post("/documents/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Tipo de archivo no soportado: {ext}")

    os.makedirs(settings.uploads_dir, exist_ok=True)
    dest = os.path.join(settings.uploads_dir, f"{uuid4().hex[:8]}_{file.filename}")
    with open(dest, "wb") as f:
        f.write(await file.read())

    try:
        result = rag_pipeline.ingest(dest, file.filename or os.path.basename(dest), ext)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Error procesando documento: {e}")
    return UploadResponse(**result)


@router.get("/documents", response_model=DocumentsResponse)
def list_documents():
    return DocumentsResponse(documents=database.list_documents())
