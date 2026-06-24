"""Generación de respuestas: Groq (Llama 3.1) con fallback a modo extractivo."""
from core.config import settings

SYSTEM_PROMPT = """Eres DocuMind AI, un asistente experto en documentos empresariales.
Responde ÚNICAMENTE basándote en el contexto proporcionado debajo.
Si la respuesta no está en el contexto, di exactamente:
"No encontré esa información en los documentos cargados."

REGLAS:
1. Responde en español.
2. Sé conciso pero completo (máximo 3 párrafos).
3. Cita SIEMPRE la fuente al final: "Fuente: [nombre_archivo], página X."
4. Si hay varias fuentes relevantes, cítalas.
5. No inventes información que no esté en el contexto.
6. Si el texto proviene de OCR y parece tener errores, añade al final:
   "(Nota: documento procesado mediante OCR.)"
7. Usa formato markdown cuando ayude a la claridad."""


def _format_context(chunks: list[dict]) -> str:
    return "\n\n".join(
        f"[{c['filename']} | página {c['page']}"
        + (f" | OCR" if (c.get("source_type") or "").endswith("ocr") else "")
        + f"]\n{c['text']}"
        for c in chunks
    )


def _extractive(chunks: list[dict]) -> str:
    if not chunks:
        return "No encontré esa información en los documentos cargados."
    lines = ["**Fragmentos más relevantes (modo extractivo):**\n"]
    for c in chunks:
        snippet = c["text"][:300].strip()
        lines.append(f"- {snippet}…\n  _Fuente: {c['filename']}, página {c['page']}._")
    return "\n".join(lines)


def answer(
    question: str,
    chunks: list[dict],
    history: list[dict] | None = None,
) -> tuple[str, bool]:
    """Devuelve (texto, used_llm). Sin Groq o ante error -> extractivo."""
    if not chunks:
        return "No encontré esa información en los documentos cargados.", False

    if not settings.groq_api_key:
        return _extractive(chunks), False

    try:
        from groq import Groq

        # Build message list: system → history turns → current question with context
        messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]

        if history:
            messages.extend(history)

        messages.append({
            "role": "user",
            "content": f"Contexto documental:\n{_format_context(chunks)}\n\nPregunta: {question}",
        })

        client = Groq(api_key=settings.groq_api_key)
        completion = client.chat.completions.create(
            model=settings.groq_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens_response,
            messages=messages,
        )
        return completion.choices[0].message.content, True
    except Exception:
        return _extractive(chunks), False
