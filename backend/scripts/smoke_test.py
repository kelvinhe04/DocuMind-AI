"""Prueba de humo de la Fase 1 (sin OCR, sin Groq -> modo extractivo).
Uso:  venv/Scripts/python.exe -m scripts.smoke_test
Crea un PDF de texto, lo sube/indexa y prueba chat/search/metrics.
NOTA: escribe en data/ real; limpia data/ después si quieres re-seedear."""
import io

from fastapi.testclient import TestClient
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

import main


def _make_pdf() -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    c.drawString(72, 720, "Constructora Nova S.A. - Manual de RRHH")
    c.drawString(72, 700, "El horario laboral es de lunes a viernes de 8:00 AM a 5:00 PM.")
    c.showPage()
    c.drawString(72, 720, "Vacaciones: un empleado con 2 anos de servicio")
    c.drawString(72, 700, "tiene derecho a 17 dias habiles de vacaciones anuales.")
    c.showPage()
    c.save()
    return buf.getvalue()


def main_test() -> None:
  # context manager dispara el evento startup (init_db)
  with TestClient(main.app) as client:
    assert client.get("/").status_code == 200, "health falló"

    up = client.post(
        "/documents/upload",
        files={"file": ("Manual_RRHH_smoke.pdf", _make_pdf(), "application/pdf")},
    )
    print("UPLOAD:", up.status_code, up.json())
    assert up.status_code == 200, up.text
    assert up.json()["source_type"] == "pdf_text"
    assert up.json()["chunks"] > 0

    docs = client.get("/documents")
    print("DOCS:", docs.status_code, len(docs.json()["documents"]))
    assert docs.status_code == 200 and len(docs.json()["documents"]) >= 1

    chat = client.post("/chat", json={"question": "Cual es el horario laboral?", "mode": "chat"})
    j = chat.json()
    print("CHAT: status", chat.status_code, "| used_llm", j["used_llm"], "| sources", len(j["sources"]))
    print("ANSWER:", (j["answer"] or "")[:220])
    assert chat.status_code == 200 and len(j["sources"]) > 0

    search = client.post("/chat", json={"question": "vacaciones", "mode": "search"})
    s = search.json()
    print("SEARCH: status", search.status_code, "| answer", s["answer"], "| sources", len(s["sources"]))
    assert search.status_code == 200 and s["answer"] is None and len(s["sources"]) > 0

    met = client.get("/metrics")
    print("METRICS:", met.status_code, met.json())
    assert met.status_code == 200 and met.json()["documents"] >= 1 and met.json()["chunks"] > 0

    print("\n[OK] SMOKE TEST PASSED")


if __name__ == "__main__":
    main_test()
