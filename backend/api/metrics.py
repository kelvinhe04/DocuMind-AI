"""Endpoint 4: métricas del dashboard."""
from fastapi import APIRouter

from core import database
from models.schemas import MetricsResponse
from services import vector_store

router = APIRouter()


@router.get("/metrics", response_model=MetricsResponse)
def get_metrics():
    summary = database.metrics_summary()
    summary["chunks"] = vector_store.count_chunks()
    return MetricsResponse(**summary)
