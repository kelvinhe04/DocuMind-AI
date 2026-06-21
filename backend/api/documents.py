"""Endpoints: subir/indexar documento, listar, eliminar y descargar."""
import glob
import os
from uuid import uuid4

from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse

from core import database
from core.config import settings
from models.schemas import DocumentsResponse, UploadResponse
from services import rag_pipeline, vector_store

router = APIRouter()

ALLOWED_EXT = {".pdf", ".jpg", ".jpeg", ".png"}


@router.post("/documents/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    x_user_id: str = Header(default=""),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Tipo de archivo no soportado: {ext}")

    if database.filename_exists(file.filename or "", x_user_id):
        raise HTTPException(
            status_code=409,
            detail=f"Ya existe un documento con el nombre '{file.filename}'.",
        )

    os.makedirs(settings.uploads_dir, exist_ok=True)
    dest = os.path.join(settings.uploads_dir, f"{uuid4().hex[:8]}_{file.filename}")
    with open(dest, "wb") as f:
        f.write(await file.read())

    try:
        result = rag_pipeline.ingest(dest, file.filename or os.path.basename(dest), ext, x_user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando documento: {e}")
    return UploadResponse(**result)


@router.get("/documents", response_model=DocumentsResponse)
def list_documents(x_user_id: str = Header(default="")):
    return DocumentsResponse(documents=database.list_documents(x_user_id))


@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str, x_user_id: str = Header(default="")):
    doc = database.get_document(doc_id, x_user_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado.")

    # Remove vectors from ChromaDB
    try:
        vector_store.delete_chunks_by_document(doc_id)
    except Exception:
        pass

    # Remove uploaded file
    filename = doc["filename"]
    matches = glob.glob(os.path.join(settings.uploads_dir, f"*_{filename}"))
    for f in matches:
        try:
            os.remove(f)
        except Exception:
            pass

    database.delete_document(doc_id, x_user_id)
    return {"ok": True}


MEDIA_TYPES = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
}


@router.get("/documents/{doc_id}/file/{filename:path}")
def get_document_file(
    doc_id: str,
    filename: str = "",
    x_user_id: str = Header(default=""),
):
    doc = database.get_document(doc_id, x_user_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado.")

    filename = doc["filename"]
    matches = glob.glob(os.path.join(settings.uploads_dir, f"*_{filename}"))
    if not matches:
        exact = os.path.join(settings.uploads_dir, filename)
        if os.path.exists(exact):
            matches = [exact]

    if not matches:
        raise HTTPException(status_code=404, detail="Archivo no encontrado en disco.")

    ext = os.path.splitext(filename)[1].lower()
    media_type = MEDIA_TYPES.get(ext, "application/octet-stream")

    return FileResponse(
        path=matches[0],
        media_type=media_type,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )
