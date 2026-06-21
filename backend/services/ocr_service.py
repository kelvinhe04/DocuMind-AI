"""Extracción de texto: PDF con texto (pymupdf), PDF escaneado e imágenes (OCR)."""
from typing import Optional

import fitz  # pymupdf
import pytesseract
from pdf2image import convert_from_path
from PIL import Image

from core.config import settings

if settings.tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd


def _preprocess(img: "Image.Image") -> "Image.Image":
    """Escala de grises + binarización simple para mejorar el OCR."""
    gray = img.convert("L")
    return gray.point(lambda x: 0 if x < 140 else 255)


def _ocr_image(img: "Image.Image") -> tuple[str, float]:
    # Intenta con el idioma configurado; si falla, cae a inglés
    for lang in (settings.ocr_lang, "spa+eng", "eng"):
        try:
            data = pytesseract.image_to_data(
                _preprocess(img), lang=lang,
                output_type=pytesseract.Output.DICT,
            )
            words = [w for w in data["text"] if w and w.strip()]
            confs = [int(c) for c in data["conf"] if str(c) not in ("-1", "")]
            text = " ".join(words)
            conf = round(sum(confs) / len(confs), 1) if confs else 0.0
            return text, conf
        except pytesseract.TesseractError:
            continue
    return "", 0.0


def extract(path: str, ext: str) -> tuple[list[dict], str, Optional[float]]:
    """Devuelve (pages, source_type, ocr_confidence).

    pages: lista de {"page": int, "text": str}
    source_type: "pdf_text" | "pdf_ocr" | "image_ocr"
    """
    ext = ext.lower()

    if ext == ".pdf":
        doc = fitz.open(path)
        pages: list[dict] = []
        total_chars = 0
        for i, page in enumerate(doc, start=1):
            t = page.get_text().strip()
            total_chars += len(t)
            pages.append({"page": i, "text": t})

        if total_chars > 100:
            doc.close()
            return pages, "pdf_text", None

        # PDF escaneado -> OCR por página
        doc.close()
        try:
            images = convert_from_path(
                path, dpi=settings.ocr_dpi,
                poppler_path=settings.poppler_path or None,
            )
        except Exception:
            # Poppler no disponible: devolver páginas sin texto
            return [{"page": 1, "text": ""}], "pdf_ocr", 0.0

        ocr_pages, confs = [], []
        for i, img in enumerate(images, start=1):
            text, conf = _ocr_image(img)
            confs.append(conf)
            ocr_pages.append({"page": i, "text": text})
        avg = round(sum(confs) / len(confs), 1) if confs else 0.0
        return ocr_pages, "pdf_ocr", avg

    # Imagen directa (.jpg/.jpeg/.png)
    img = Image.open(path)
    text, conf = _ocr_image(img)
    return [{"page": 1, "text": text}], "image_ocr", conf
