"""Endpoint 4: métricas del dashboard."""
from fastapi import APIRouter, Header

from core import database
from models.schemas import MetricsResponse
from services import vector_store

router = APIRouter()


@router.get("/metrics", response_model=MetricsResponse)
def get_metrics(x_user_id: str = Header(default="")):
    uid = x_user_id or None
    summary = database.metrics_summary(uid or "")
    summary["chunks"] = vector_store.count_chunks(uid)
    return MetricsResponse(**summary)
