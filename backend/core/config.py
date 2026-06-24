"""Configuración central (pydantic-settings) leída desde backend/.env."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Groq (LLM). Si está vacío -> modo extractivo.
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"

    # Paths
    chroma_persist_dir: str = "./data/chroma"
    sqlite_db_path: str = "./data/documind.db"
    uploads_dir: str = "./data/uploads"
    demo_dir: str = "./data/demo"

    # Embeddings (ChromaDB usa all-MiniLM-L6-v2 ONNX por defecto)
    embedding_model: str = "all-MiniLM-L6-v2"

    # Chunking / RAG
    chunk_size: int = 1000
    chunk_overlap: int = 200
    top_k_retrieval: int = 8
    max_tokens_response: int = 1024
    temperature: float = 0.1

    # OCR
    tesseract_cmd: str = ""
    ocr_lang: str = "spa"
    ocr_dpi: int = 300
    poppler_path: str = ""


settings = Settings()
