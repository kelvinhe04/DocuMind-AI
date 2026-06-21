# DocuMind AI — plan.md (Plan de Implementación Combinado v3 + v4)

**Versión:** 1.0 (combinación de PRD v3.0 Final + PRD v4.0 Completo)
**Fecha:** 20 de junio de 2026
**Equipo:** Grupo 1GS241 — UTP · Innovación y Emprendimiento · Prof. Melvin Falcon
**Filosofía:** "Demo que vende la visión, no producto terminado."

> Este `plan.md` es el guion para implementar todo en las siguientes iteraciones, **archivo por archivo**.
> Cada fase tiene: **Objetivo**, **Archivos**, **Comandos exactos**, **Código clave**, **Criterios de aceptación** y **Tiempo estimado**.

---

## 0. DECISIONES DE ALCANCE (resueltas)

Combinamos el núcleo lean del **v3** con las funciones ricas del **v4**, respetando tus restricciones:

| Tema | Decisión | Origen |
|------|----------|--------|
| Docker | ❌ Sin Docker. Todo nativo. | v3 + v4 |
| Hot reload | ✅ `pnpm dev` (front) + `uvicorn --reload` (back) | v3 + v4 |
| Endpoints FastAPI | ✅ **Exactamente 4** funcionales (ver §3) | restricción |
| LLM | ✅ **Groq único** (`llama-3.1-8b-instant`) | restricción |
| Fallback | ✅ **Modo extractivo** (top-k chunks sin LLM) | v3 |
| Frontend | ✅ Next.js 14 + shadcn/ui **copiando componentes** (`npx shadcn add`) | restricción |
| Auth | ✅ **Clerk real** (cuentas reales para poder pagar) | v4 + tu decisión |
| Pagos | ✅ **Stripe real en modo test** (mostrar Free vs Pago en vivo) | v4 + tu decisión |
| Webhooks / ngrok | ❌ **No necesarios.** Usamos *Checkout + verificación por redirect* (`session_id`) → actualiza plan en metadatos de Clerk. Webhooks = mejora opcional. | decisión |
| OCR | ✅ **Incluido** (Tesseract + pdf2image + Pillow) para PDFs escaneados e imágenes | v4 |
| Landing | ✅ **Integrada** en el mismo proyecto Next.js (ruta `/`) | v4 |
| Entregables | ✅ App + Landing + **Word (.docx)** + **Pitch Deck (.pptx)** + README | v3 + v4 |

### Cómo respetamos "solo 4 endpoints en FastAPI"
- Stripe y Clerk viven en **API Routes de Next.js**, NO en FastAPI → no cuentan.
- El **plan del usuario** (free/starter/business) se guarda en `publicMetadata` de Clerk → no requiere endpoint extra.
- La **búsqueda semántica** se fusiona en `POST /chat` con un parámetro `mode` (`chat` | `search`) → mismo endpoint, doble uso. Ese mismo camino sirve de **fallback extractivo**.
- El **gating Free vs Pago** se aplica en la capa proxy de Next.js (lee el plan de Clerk antes de reenviar a FastAPI) → FastAPI se mantiene "tonto" y limpio.

---

## 1. ARQUITECTURA COMBINADA

```
┌──────────────────────────────────────────────────────────────────┐
│  NAVEGADOR  ·  http://localhost:3000                              │
└───────────────────────────────┬──────────────────────────────────┘
                                 │
┌───────────────────────────────▼──────────────────────────────────┐
│  NEXT.JS 14 (App Router)  ·  pnpm dev  ·  puerto 3000             │
│                                                                    │
│  /                 → Landing pública (Hero, Features, Pricing...) │
│  /sign-in /sign-up → Clerk (auth real)                           │
│  /dashboard /chat /documents /upload /search /billing /pricing    │
│                    → App protegida (Clerk middleware)             │
│                                                                    │
│  API ROUTES (Next.js, NO cuentan como endpoints FastAPI):        │
│   /api/stripe/checkout   → crea Checkout Session (Stripe)        │
│   /api/stripe/confirm    → verifica session_id → sube plan Clerk │
│   /api/proxy/[...path]   → proxy a FastAPI (aplica gating plan)  │
└───────────────────────────────┬──────────────────────────────────┘
                                 │ HTTP/REST JSON
┌───────────────────────────────▼──────────────────────────────────┐
│  FASTAPI  ·  uvicorn --reload  ·  puerto 8000                     │
│                                                                    │
│  4 ENDPOINTS FUNCIONALES:                                         │
│   POST /documents/upload  → extrae(OCR si aplica)+chunk+embed+idx │
│   GET  /documents         → lista documentos                     │
│   POST /chat              → RAG (mode=chat|search) + extractivo   │
│   GET  /metrics           → métricas del dashboard               │
│  (GET / = health utilitario, no cuenta)                          │
└───────┬──────────────────┬──────────────────┬────────────────────┘
        ▼                  ▼                  ▼
  ┌───────────┐     ┌────────────┐     ┌────────────┐
  │  PIPELINE │     │  CHROMADB  │     │   SQLITE   │
  │ RAG + OCR │────▶│ (vectores) │     │ (metadata) │
  └─────┬─────┘     └────────────┘     └────────────┘
        ▼
  ┌──────────────────────────────────────────┐
  │ GROQ API (llama-3.1-8b-instant)          │
  │ └─ fallback: modo extractivo (sin LLM)   │
  └──────────────────────────────────────────┘
```

---

## 2. STACK

> ⚙️ **Versiones REALES instaladas** (2026, difieren del plan original — ver notas):

**Frontend / Full-stack (Next.js)**
Next.js **14.2.35** · React 18 · TypeScript 5 · **Tailwind v4.3** (⚠️ no v3: shadcn 4.x lo exige) · shadcn/ui 4.11 con **Base UI** (`@base-ui/react`, no Radix) · @clerk/nextjs **7** · stripe **22** + @stripe/stripe-js · framer-motion **12** · recharts **3** · react-hook-form 7 · zod **4** · axios · lucide-react · zustand 5 · sonner (toasts) · next-themes · react-dropzone · pnpm 11

**Backend AI (FastAPI)**
Python 3.11 · FastAPI **0.138** · Uvicorn · Pydantic **2.13** + pydantic-settings · langchain-text-splitters · **chromadb 1.5** · embeddings = **ChromaDB DefaultEmbeddingFunction (ONNX all-MiniLM-L6-v2, SIN PyTorch)** · groq 1.x · pymupdf · pdf2image · pytesseract · Pillow · numpy · reportlab (PDFs demo) · python-docx (Word) · python-pptx (Pitch)

> **Notas de implementación:** Tailwind se migró a **v4** (postcss `@tailwindcss/postcss`, `globals.css` con `@import "tailwindcss"` + `@theme inline` + tokens oklch; `tailwind.config.ts` queda inerte). Embeddings vía ChromaDB ONNX (mismo modelo, evita ~2GB de torch). pnpm 11 requiere `allowBuilds` en `pnpm-workspace.yaml` y `CI=true` para instalar sin prompt.

**Servicios externos (gratis)**
Clerk (auth, 10k MAU gratis) · Stripe (test mode) · Groq (30 req/min gratis) · Tesseract OCR (local) · Poppler (local, para pdf2image)

---

## 3. LOS 4 ENDPOINTS (contrato de API)

| # | Método | Ruta | Entrada | Salida | Notas |
|---|--------|------|---------|--------|-------|
| 1 | POST | `/documents/upload` | `multipart: file` | `{document_id, filename, source_type, pages, chunks, ocr_confidence?}` | Detecta PDF-texto / PDF-escaneado / imagen → OCR si aplica |
| 2 | GET | `/documents` | — | `{documents: [{id, filename, source_type, pages, chunks, status, uploaded_at}]}` | Lista para tabla y dashboard |
| 3 | POST | `/chat` | `{question, mode, top_k?, filter_doc?}` | `{mode, answer?, sources:[{filename,page,text,score}], latency_ms, used_llm}` | `mode="chat"`→Groq; `mode="search"`→solo chunks; sin Groq→extractivo |
| 4 | GET | `/metrics` | — | `{documents, chunks, queries, storage_mb, activity:[{date,count}]}` | Tarjetas + gráfica Recharts |

> `GET /` devuelve `{"status":"ok"}` (health utilitario, no cuenta como uno de los 4).

---

## 4. ESTRUCTURA DE CARPETAS (objetivo final)

```
DocuMind AI/
├── plan.md                      ← este archivo
├── Contexto/                    ← PRDs originales (no tocar)
├── README.md
│
├── package.json  pnpm-lock.yaml  next.config.mjs
├── tailwind.config.ts  tsconfig.json  components.json
├── .env.local                   ← Clerk + Stripe + URL FastAPI
├── .env.example
│
├── public/
│   ├── logo.svg  hero-screenshot.png  demo-video-placeholder.jpg
│
├── src/
│   ├── middleware.ts            ← Clerk (protege /dashboard, etc.)
│   ├── app/
│   │   ├── layout.tsx           ← ClerkProvider + <Toaster/>
│   │   ├── page.tsx             ← LANDING (/)
│   │   ├── globals.css
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx       ← Sidebar + Topbar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── chat/page.tsx
│   │   │   ├── documents/page.tsx
│   │   │   ├── upload/page.tsx
│   │   │   ├── search/page.tsx
│   │   │   ├── billing/page.tsx
│   │   │   └── pricing/page.tsx
│   │   └── api/
│   │       ├── stripe/checkout/route.ts
│   │       ├── stripe/confirm/route.ts
│   │       └── proxy/[...path]/route.ts   ← reenvía a FastAPI + gating
│   ├── components/
│   │   ├── landing/  (Navbar, Hero, LogoCloud, Features, HowItWorks,
│   │   │              DemoVideo, Pricing, Testimonials, Stats, CTA, Footer)
│   │   ├── app/      (Sidebar, Topbar, ChatInterface, DocumentList,
│   │   │              UploadDropzone, SearchResults, MetricsDashboard,
│   │   │              SourceCitations, BillingCard, PlanBadge, UpgradeDialog)
│   │   └── ui/       ← shadcn (button, card, dialog, input, tabs, table,
│   │                   dropdown-menu, sheet, sonner, progress, badge,
│   │                   avatar, skeleton, tooltip, separator, label, select)
│   ├── lib/
│   │   ├── utils.ts   plans.ts (definición de planes/limites)
│   │   ├── api.ts     (cliente axios → /api/proxy)
│   │   └── stripe.ts
│   ├── hooks/  (useDocuments, useChat, useUpload, usePlan)
│   └── types/  (document.ts, chat.ts, plan.ts)
│
├── backend/
│   ├── main.py                  ← FastAPI app + CORS + seed al startup
│   ├── requirements.txt
│   ├── .env                     ← Groq + paths + chunking + OCR
│   ├── .env.example
│   ├── api/
│   │   ├── documents.py         ← upload + list (endpoints 1 y 2)
│   │   ├── chat.py              ← chat/search/extractivo (endpoint 3)
│   │   └── metrics.py           ← métricas (endpoint 4)
│   ├── core/
│   │   ├── config.py            ← Settings (pydantic-settings)
│   │   └── database.py          ← SQLite (init + helpers)
│   ├── services/
│   │   ├── rag_pipeline.py      ← orquesta extract→chunk→embed→index / query
│   │   ├── ocr_service.py       ← pymupdf / pdf2image+pytesseract / Pillow
│   │   ├── vector_store.py      ← wrapper ChromaDB
│   │   └── llm_service.py       ← Groq + extractivo
│   ├── models/
│   │   └── schemas.py           ← Pydantic (request/response)
│   ├── scripts/
│   │   └── generate_demo_docs.py ← crea los 7 archivos demo
│   └── data/                    ← (NO versionar) uploads/ chroma/ demo/ documind.db
│
└── docs/                        ← entregables generados
    ├── generate_word.py         ← genera el .docx
    ├── generate_pptx.py         ← genera el .pptx
    ├── DocuMind_Presentacion_Semestral.docx
    └── DocuMind_Pitch_Deck.pptx
```

---

## 5. VARIABLES DE ENTORNO

### `.env.local` (raíz, Next.js)
```ini
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Stripe (modo test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_BUSINESS=price_xxx
STRIPE_PRICE_ENTERPRISE=price_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend
FASTAPI_URL=http://localhost:8000
```

### `backend/.env`
```ini
GROQ_API_KEY=gsk_xxx
GROQ_MODEL=llama-3.1-8b-instant

CHROMA_PERSIST_DIR=./data/chroma
SQLITE_DB_PATH=./data/documind.db
UPLOADS_DIR=./data/uploads
DEMO_DIR=./data/demo

EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RETRIEVAL=5
MAX_TOKENS_RESPONSE=1024
TEMPERATURE=0.1

# OCR (Windows: ajustar ruta de Tesseract)
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
OCR_LANG=spa
OCR_DPI=300
# Poppler (Windows): carpeta bin de poppler para pdf2image
POPPLER_PATH=C:\poppler\Library\bin
```

> El **modo extractivo** se activa solo si `GROQ_API_KEY` está vacío o si la llamada a Groq falla. La app NUNCA se cae por falta de API key.

---

# FASES DE IMPLEMENTACIÓN

> Orden recomendado. Cada fase es ejecutable y verificable de forma independiente.

---

## FASE 0 — Setup inicial · ⏱️ ~3-4 h

**Objetivo:** Dejar listos ambos entornos (Next.js + FastAPI), dependencias del sistema (Tesseract, Poppler) y las cuentas externas (Clerk, Stripe, Groq), con "hello world" corriendo en ambos puertos.

### 0.1 Crear el proyecto Next.js (en la raíz actual)
```bash
# desde "DocuMind AI/"
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
# Si pregunta por sobrescribir Contexto/plan.md: NO sobrescribir (son archivos no conflictivos)

npx shadcn@latest init -d   # base color: Slate
```

### 0.2 Dependencias frontend
```bash
pnpm add @clerk/nextjs stripe @stripe/stripe-js framer-motion recharts \
  react-hook-form zod axios lucide-react zustand sonner react-dropzone

# Componentes shadcn (copiados al repo)
npx shadcn@latest add button card dialog input tabs table dropdown-menu \
  sheet sonner progress badge avatar skeleton tooltip separator label select scroll-area
```

### 0.3 Backend FastAPI
```bash
mkdir backend && cd backend
python -m venv venv
venv\Scripts\activate            # PowerShell: venv\Scripts\Activate.ps1
```

**`backend/requirements.txt`:**
```
fastapi==0.110.0
uvicorn[standard]==0.27.0
pydantic==2.6.0
pydantic-settings==2.2.1
python-dotenv==1.0.1
python-multipart==0.0.9
langchain-text-splitters==0.0.1
chromadb==0.4.24
sentence-transformers==2.5.1
groq==0.4.2
pymupdf==1.23.26
pdf2image==1.17.0
pytesseract==0.3.10
Pillow==10.2.0
numpy==1.26.4
reportlab==4.1.0
python-docx==1.1.0
python-pptx==0.6.23
```
```bash
pip install -r requirements.txt
mkdir -p api core services models scripts data/uploads data/chroma data/demo
```

### 0.4 Dependencias del sistema (Windows)
- **Tesseract OCR:** descargar de https://github.com/UB-Mannheim/tesseract/wiki → instalar → marcar idioma **Spanish** → confirmar ruta en `TESSERACT_CMD`.
- **Poppler** (para `pdf2image`): descargar https://github.com/oschwartz10612/poppler-windows/releases → descomprimir en `C:\poppler` → ruta `bin` en `POPPLER_PATH`.
- Verificar: `tesseract --version` y `pdfinfo -v`.

### 0.5 Cuentas externas (gratis)
1. **Groq:** https://console.groq.com → crear API key → `GROQ_API_KEY`.
2. **Clerk:** https://clerk.com → nueva app → copiar `pk_test` / `sk_test` → habilitar Email + Google OAuth.
3. **Stripe:** https://dashboard.stripe.com (modo **Test**) → crear 3 **Products** con precios recurrentes mensuales (Starter $49, Business $199, Enterprise $999) → copiar los `price_...`.

**Criterios de aceptación Fase 0:**
- [ ] `pnpm dev` levanta Next en `:3000` sin errores.
- [ ] `uvicorn main:app --reload --port 8000` levanta FastAPI (con un `main.py` mínimo) y `GET /` responde `{"status":"ok"}`.
- [ ] `tesseract --version` y `pdfinfo -v` funcionan.
- [ ] `.env.local` y `backend/.env` llenos con keys reales.

---

## FASE 1 — Backend core: RAG + OCR + 4 endpoints · ⏱️ ~8-10 h

**Objetivo:** Pipeline RAG completo con OCR y los 4 endpoints funcionando, verificables desde Swagger (`/docs`).

### 1.1 `backend/core/config.py` — Settings
```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    chroma_persist_dir: str = "./data/chroma"
    sqlite_db_path: str = "./data/documind.db"
    uploads_dir: str = "./data/uploads"
    demo_dir: str = "./data/demo"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    top_k_retrieval: int = 5
    max_tokens_response: int = 1024
    temperature: float = 0.1
    tesseract_cmd: str = ""
    ocr_lang: str = "spa"
    ocr_dpi: int = 300
    poppler_path: str = ""

settings = Settings()
```

### 1.2 `backend/core/database.py` — SQLite
- Tabla `documents(id, filename, source_type, pages, chunks, status, ocr_confidence, uploaded_at)`.
- Tabla `queries(id, question, mode, used_llm, latency_ms, created_at)` (para métricas `queries` y `activity`).
- Funciones: `init_db()`, `insert_document(...)`, `list_documents()`, `insert_query(...)`, `metrics_summary()`.

### 1.3 `backend/services/ocr_service.py` — Extracción + OCR
Lógica de clasificación (de v4 §E.2):
```python
import fitz  # pymupdf
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
from core.config import settings

if settings.tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd

def _preprocess(img: Image.Image) -> Image.Image:
    g = img.convert("L")                       # grayscale
    return g.point(lambda x: 0 if x < 140 else 255)  # threshold simple

def extract(path: str, ext: str):
    """Devuelve (pages:list[{page,text}], source_type, ocr_confidence|None)."""
    if ext == ".pdf":
        doc = fitz.open(path)
        pages, total = [], 0
        for i, pg in enumerate(doc, 1):
            t = pg.get_text().strip()
            total += len(t)
            pages.append({"page": i, "text": t})
        if total > 100:                         # PDF con texto
            return pages, "pdf_text", None
        # PDF escaneado → OCR por página
        imgs = convert_from_path(path, dpi=settings.ocr_dpi,
                                 poppler_path=settings.poppler_path or None)
        ocr_pages, confs = [], []
        for i, im in enumerate(imgs, 1):
            data = pytesseract.image_to_data(_preprocess(im), lang=settings.ocr_lang,
                                             output_type=pytesseract.Output.DICT)
            txt = " ".join(w for w in data["text"] if w.strip())
            cs = [int(c) for c in data["conf"] if c not in ("-1", -1)]
            confs += cs
            ocr_pages.append({"page": i, "text": txt})
        conf = round(sum(confs)/len(confs), 1) if confs else 0.0
        return ocr_pages, "pdf_ocr", conf
    else:                                        # imagen .jpg/.png
        im = Image.open(path)
        data = pytesseract.image_to_data(_preprocess(im), lang=settings.ocr_lang,
                                         output_type=pytesseract.Output.DICT)
        txt = " ".join(w for w in data["text"] if w.strip())
        cs = [int(c) for c in data["conf"] if c not in ("-1", -1)]
        conf = round(sum(cs)/len(cs), 1) if cs else 0.0
        return [{"page": 1, "text": txt}], "image_ocr", conf
```

### 1.4 `backend/services/vector_store.py` — ChromaDB
```python
import chromadb
from chromadb.utils import embedding_functions
from core.config import settings

_client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name=settings.embedding_model)
collection = _client.get_or_create_collection("documind_documents",
                                               embedding_function=_ef)

def add_chunks(ids, texts, metadatas):
    collection.add(ids=ids, documents=texts, metadatas=metadatas)

def query(text: str, k: int, filter_doc: str | None = None):
    where = {"filename": filter_doc} if filter_doc else None
    res = collection.query(query_texts=[text], n_results=k, where=where)
    out = []
    for txt, meta, dist in zip(res["documents"][0], res["metadatas"][0], res["distances"][0]):
        out.append({"text": txt, "filename": meta["filename"], "page": meta["page"],
                    "source_type": meta.get("source_type"), "score": round(1 - dist, 3)})
    return out

def count_chunks():
    return collection.count()
```

### 1.5 `backend/services/rag_pipeline.py` — Orquestación
- `ingest(path, filename, ext)`: `ocr_service.extract` → limpieza → `RecursiveCharacterTextSplitter(chunk_size, chunk_overlap)` por página (conserva `page`) → `vector_store.add_chunks` con metadata `{filename, page, chunk_index, source_type}` → `database.insert_document`.
- `retrieve(question, k, filter_doc)`: `vector_store.query`.

### 1.6 `backend/services/llm_service.py` — Groq + extractivo
```python
from groq import Groq
from core.config import settings

SYSTEM_PROMPT = """Eres DocuMind AI, asistente experto en documentos empresariales.
Responde ÚNICAMENTE con el contexto dado. Si no está, di exactamente:
"No encontré esa información en los documentos cargados."
Reglas: 1) Español. 2) Conciso pero completo (máx 3 párrafos).
3) Cita SIEMPRE la fuente al final: "Fuente: [archivo], página X."
4) No inventes. 5) Si el texto viene de OCR con errores, añade:
"(Nota: documento procesado mediante OCR.)" 6) Usa markdown."""

def answer(question: str, chunks: list[dict]) -> tuple[str, bool]:
    """Devuelve (texto, used_llm). Si no hay Groq o falla → extractivo."""
    context = "\n\n".join(f"[{c['filename']} p.{c['page']}] {c['text']}" for c in chunks)
    if not settings.groq_api_key:
        return _extractive(chunks), False
    try:
        client = Groq(api_key=settings.groq_api_key)
        r = client.chat.completions.create(
            model=settings.groq_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens_response,
            messages=[{"role": "system", "content": SYSTEM_PROMPT},
                      {"role": "user",
                       "content": f"Contexto:\n{context}\n\nPregunta: {question}"}])
        return r.choices[0].message.content, True
    except Exception:
        return _extractive(chunks), False

def _extractive(chunks: list[dict]) -> str:
    if not chunks:
        return "No encontré esa información en los documentos cargados."
    lines = ["**Fragmentos más relevantes (modo extractivo):**\n"]
    for c in chunks:
        lines.append(f"- {c['text'][:300]}…\n  _Fuente: {c['filename']}, página {c['page']}._")
    return "\n".join(lines)
```

### 1.7 Endpoints
- `api/documents.py`:
  - `POST /documents/upload` → guarda en `uploads/` → `rag_pipeline.ingest` → respuesta.
  - `GET /documents` → `database.list_documents()`.
- `api/chat.py`:
  - `POST /chat` → `rag_pipeline.retrieve` → si `mode=="search"`: devuelve `sources` (sin LLM) → si `mode=="chat"`: `llm_service.answer` → registra query → respuesta `{mode, answer?, sources, latency_ms, used_llm}`.
- `api/metrics.py`:
  - `GET /metrics` → `database.metrics_summary()` + `vector_store.count_chunks()`.

### 1.8 `backend/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import init_db
from api import documents, chat, metrics

app = FastAPI(title="DocuMind AI API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"],
                   allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def _startup():
    init_db()
    # seed demo se agrega en Fase 7

@app.get("/")
def health(): return {"status": "ok"}

app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(metrics.router)
```

**Criterios de aceptación Fase 1:**
- [ ] En `/docs` aparecen **exactamente 4** endpoints funcionales + `GET /`.
- [ ] Subir un PDF de texto → responde con `chunks > 0`, `source_type="pdf_text"`.
- [ ] Subir una imagen JPG con texto → `source_type="image_ocr"` y `ocr_confidence` numérico.
- [ ] `POST /chat mode=chat` con Groq → respuesta con cita "Fuente: …, página X".
- [ ] Borrar `GROQ_API_KEY` → `POST /chat` sigue respondiendo (modo extractivo, `used_llm=false`).
- [ ] `POST /chat mode=search` → devuelve `sources` ordenados por `score`.

---

## FASE 2 — Frontend base + Auth (Clerk) · ⏱️ ~5-6 h

**Objetivo:** App Router con ClerkProvider, middleware protegiendo rutas, layouts (landing shell + app shell con Sidebar/Topbar), y `lib`/`hooks` base.

### 2.1 `src/app/layout.tsx` — ClerkProvider + Toaster (sonner)
### 2.2 `src/middleware.ts` — Clerk
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
const isProtected = createRouteMatcher([
  "/dashboard(.*)","/chat(.*)","/documents(.*)","/upload(.*)",
  "/search(.*)","/billing(.*)","/pricing(.*)",
]);
export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) return redirectToSignIn();   // ⚠️ NO usar auth.protect():
  }                                            // en modo keyless devuelve 404 en vez de redirigir
});
export const config = { matcher: ["/((?!.*\\..*|_next).*)","/","/(api|trpc)(.*)"] };
```

> ⚠️ **Aprendizajes Fase 2 (ya aplicados):**
> - **NO usar `auth.protect()`** en el middleware: en modo keyless devuelve **404** a usuarios sin sesión (parece que la ruta no existe). Usar `redirectToSignIn()` → redirige (307) a `/sign-in`.
> - **NO usar route groups `(app)/`** para la app: en este setup (Next 14.2.35 + Windows) los route groups dieron problemas. En su lugar, las páginas protegidas son rutas top-level (`src/app/dashboard/page.tsx`, etc.) que envuelven su contenido en un componente **`<AppShell>`** (Sidebar + Topbar). Las URLs siguen siendo `/dashboard`, `/chat`, etc.
> - Clerk corre en **modo keyless** sin keys (dev); imprime una URL para reclamar las keys.
### 2.3 `sign-in` / `sign-up` con `<SignIn/>` `<SignUp/>` de Clerk.
### 2.4 `src/components/app/AppShell.tsx` — Sidebar + Topbar + `<main>` (wrapper que usa cada página protegida; reemplaza al layout de route group). El `<PlanBadge/>` y `<UserButton/>` viven en Sidebar/Topbar.
### 2.5 `src/lib/plans.ts` — fuente única de límites:
```typescript
export const PLANS = {
  free:    { name:"Free",    price:0,   maxDocs:3,  ocr:false, queriesMonth:20 },
  starter: { name:"Starter", price:49,  maxDocs:Infinity, ocr:true,  queriesMonth:Infinity },
  business:{ name:"Business",price:199, maxDocs:Infinity, ocr:true,  queriesMonth:Infinity },
  enterprise:{name:"Enterprise",price:999,maxDocs:Infinity,ocr:true, queriesMonth:Infinity },
} as const;
export type PlanId = keyof typeof PLANS;
```
### 2.6 `src/lib/api.ts` — axios apuntando a `/api/proxy`.
### 2.7 `src/hooks/usePlan.ts` — lee `user.publicMetadata.plan` (default `free`).

**Criterios de aceptación Fase 2:**
- [ ] Visitar `/dashboard` sin sesión → redirige a `/sign-in`.
- [ ] Registrarse → entra a `/dashboard` con Sidebar/Topbar visibles.
- [ ] `<PlanBadge/>` muestra "Free" por defecto.

---

## FASE 3 — Landing page futurista · ⏱️ ~6-7 h

**Objetivo:** Landing tipo SaaS (Vercel/Linear) en `/`, con todas las secciones del v4 §G, responsive y animada (Framer Motion).

**Archivos** (`src/components/landing/` + `src/app/page.tsx`):
Navbar (transparente→sólido al scroll), Hero (badge "Ahora con OCR", H1 "El cerebro digital de tu empresa", CTAs → /sign-up y scroll a demo, screenshot flotante), LogoCloud, Features (6 tarjetas: búsqueda semántica, chat con citas, OCR, analytics, multi-workspace, on-premise), HowItWorks (3 pasos), DemoVideo (placeholder con play), Pricing (4 planes, toggle mensual/anual −17%, botones → /sign-up), Testimonials (Nova S.A., Bufete Méndez, U. del Pacífico), Stats ("500+ docs", "10k+ preguntas", "50+ en waitlist", "99.2% precisión"), CTA (form email waitlist), Footer.

**Diseño (v4 §G.2):** fondo `slate-950→slate-900` con grid de puntos; acentos `violet-500` (primario), `emerald-500` (CTA), `amber-500` (badge OCR); tipografía Inter; Framer Motion (fade-in al scroll, slide-up en cards, hover scale+glow); glassmorphism en navbar/cards; gradient border en plan recomendado.

**Criterios de aceptación Fase 3:**
- [ ] `/` renderiza todas las secciones, responsive (móvil/desktop).
- [ ] Animaciones de entrada al hacer scroll.
- [ ] Botones de pricing/CTA llevan a `/sign-up`.

---

## FASE 4 — App autenticada + Integración con backend · ⏱️ ~10-12 h

**Objetivo:** Las 6 páginas de la app consumiendo FastAPI vía el proxy de Next.js.

### 4.1 Proxy `src/app/api/proxy/[...path]/route.ts`
Reenvía a `FASTAPI_URL`, propaga method/body/multipart, y **aplica gating** (lee plan de Clerk):
```typescript
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PLANS, PlanId } from "@/lib/plans";

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const path = params.path.join("/");

  // Gating de upload (límite de docs + OCR según plan)
  if (path === "documents/upload") {
    const user = await (await clerkClient()).users.getUser(userId);
    const plan = (user.publicMetadata.plan as PlanId) ?? "free";
    // (validar nº de docs vía GET /documents y tipo de archivo contra PLANS[plan])
    // si excede → return 402 { error: "upgrade_required", reason }
  }
  const url = `${process.env.FASTAPI_URL}/${path}${req.nextUrl.search}`;
  const res = await fetch(url, { method: req.method,
    body: ["GET","HEAD"].includes(req.method) ? undefined : await req.blob(),
    headers: { "content-type": req.headers.get("content-type") ?? "" } });
  return new NextResponse(res.body, { status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" } });
}
export { handler as GET, handler as POST };
```

### 4.2 Páginas (v4 §H.2)
- **`/dashboard`** — `MetricsDashboard` (4 tarjetas + gráfica Recharts desde `/metrics`), tabla de documentos recientes, quick actions, alerta "Te quedan N documentos en Free".
- **`/chat`** — `ChatInterface` (burbujas, "pensando…", markdown, preguntas sugeridas) + `SourceCitations` (citas clickeables → modal con el fragmento). Usa `/chat mode=chat`.
- **`/documents`** — `DocumentList` (tabla: nombre, tipo, páginas, fecha, estado; badge "OCR"; filtros).
- **`/upload`** — `UploadDropzone` (react-dropzone; PDF/JPG/PNG; preview; progreso "Extrayendo…→Embeddings…→Indexando…"; resultado con páginas/chunks/confianza OCR). Bloqueos de plan vía respuesta 402 del proxy → abre `UpgradeDialog`.
- **`/search`** — barra semántica + `SearchResults` (highlight + score). Usa `/chat mode=search`.
- **`/billing`** y **`/pricing`** — se completan en Fase 5.

**Criterios de aceptación Fase 4:**
- [ ] Dashboard muestra métricas reales del backend.
- [ ] Chat devuelve respuesta con citas clickeables.
- [ ] Upload de PDF e imagen funciona end-to-end y aparece en `/documents`.
- [ ] Search devuelve fragmentos con score.

---

## FASE 5 — Pagos (Stripe) + Gating Free vs Pago · ⏱️ ~6-7 h

**Objetivo:** El momento estrella del demo: usuario Free topa límites → paga con Stripe (test) → plan sube a Starter → se desbloquean OCR/imágenes y documentos ilimitados, **en vivo, sin webhooks/ngrok**.

### 5.1 `src/app/api/stripe/checkout/route.ts`
```typescript
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const { priceId, plan } = await req.json();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=1`,
    client_reference_id: userId,
  });
  return NextResponse.json({ url: session.url });
}
```

### 5.2 `src/app/api/stripe/confirm/route.ts` — verifica y sube plan en Clerk
```typescript
import { auth, clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const { sessionId, plan } = await req.json();
  const s = await stripe.checkout.sessions.retrieve(sessionId);
  if (s.payment_status !== "paid") return NextResponse.json({ ok: false }, { status: 402 });
  await (await clerkClient()).users.updateUserMetadata(userId!, {
    publicMetadata: { plan },
  });
  return NextResponse.json({ ok: true, plan });
}
```

### 5.3 `/billing` y `/pricing`
- `/pricing` (dentro de la app): 4 planes; botón "Elegir plan" → `POST /api/stripe/checkout` → `window.location = url`.
- `/billing`: al volver con `?session_id=...&plan=...` → llama `POST /api/stripe/confirm` → `user.reload()` → muestra plan actualizado. Muestra uso (docs/queries/storage), método de pago mock, historial mock.
- Tarjeta de prueba: `4242 4242 4242 4242`, fecha futura, CVC cualquiera.

### 5.4 Gating efectivo (cierra el círculo con Fase 4.1)
- Free: `maxDocs=3`, `ocr=false`. Proxy devuelve **402** `{reason}` al exceder → `UpgradeDialog` con CTA a `/pricing`.
- Tras pagar: `publicMetadata.plan="starter"` → `usePlan()` refleja Starter → desbloqueo inmediato.

**Criterios de aceptación Fase 5:**
- [ ] Free + intentar subir 4.º documento → bloqueo + UpgradeDialog.
- [ ] Free + subir imagen → bloqueo "OCR es de Starter".
- [ ] Checkout con 4242… → redirige a `/billing` → plan pasa a **Starter** sin recargar manualmente.
- [ ] Tras pagar: subir imagen (OCR) y >3 docs funciona.

---

## FASE 6 — Polish y robustez · ⏱️ ~5-6 h

**Objetivo:** Demo a prueba de fallos.
- Estados de carga (skeletons) y vacíos en todas las páginas.
- Manejo de errores + `sonner` toasts (upload, chat, pago, límites).
- Responsive completo (sidebar → `Sheet` en móvil).
- Indicador visual cuando la respuesta es **extractiva** (`used_llm=false`) vs Groq.
- Preguntas sugeridas en el chat (las 12 del demo) como chips clickeables.
- Manejo de timeouts de Groq (spinner + fallback transparente).

**Criterios de aceptación:** recorrer las 6 páginas sin errores de consola; cortar internet → chat sigue (extractivo); móvil usable.

---

## FASE 7 — Documentos demo + seed automático · ⏱️ ~4-5 h

**Objetivo:** Generar los **7 documentos demo** de Constructora Nova S.A. e indexarlos automáticamente al iniciar FastAPI.

### 7.1 `backend/scripts/generate_demo_docs.py`
Con **reportlab** genera los 5 PDFs de texto, con contenido que hace **verdaderas** las 12 respuestas del demo (v4 §O.2). Con **Pillow** renderiza texto sobre imagen para los 2 casos OCR:

| ID | Archivo | Tipo | Contenido clave (para que el demo cuadre) |
|----|---------|------|-------------------------------------------|
| 001 | Contrato_Laboral_Nova_2026.pdf | pdf_text | preaviso **30 días** (p.3); seguro médico emergencias **100%** (p.4) |
| 002 | Manual_RRHH_Nova.pdf | pdf_text | horario **L-V 8am-5pm** (p.2); **17 días** vacaciones a 2 años (p.4); causales despido (p.6) |
| 003 | Reglamento_Interno_Nova.pdf | pdf_text | renuncia sin preaviso → pérdida de beneficios (p.3) |
| 004 | Contrato_Arrendamiento_Oficina.pdf | pdf_text | plazo **24 meses** (p.2); canon **$3,500** (p.3) |
| 005 | Politica_Compras_Proveedores.pdf | pdf_text | **3 cotizaciones** >$500 (p.3); aprueba GG+Finanzas $3,000 (p.4) |
| 006 | Acta_Reunion_Directiva_Nova.jpg | image_ocr | acta con presupuesto (texto renderizado en imagen) |
| 007 | Factura_Servicios_Enero_2026.pdf | pdf_ocr | factura escaneada (imagen → PDF) con monto a pagar |

### 7.2 Seed en `main.py` (startup)
`seed_demo()`: si `documents` está vacío → para cada archivo en `data/demo/` → `rag_pipeline.ingest(...)` → log `"7 documentos demo cargados"`. Idempotente.

**Criterios de aceptación Fase 7:**
- [ ] Borrar `data/` y reiniciar uvicorn → se cargan 7 docs automáticamente.
- [ ] Las 12 preguntas del demo devuelven la respuesta y página esperadas.
- [ ] DOC-006 (imagen) responde con la nota "(procesado mediante OCR)".

---

## FASE 8 — Documento Word (.docx) · ⏱️ ~4-5 h

**Objetivo:** `docs/generate_word.py` (python-docx) que genera `DocuMind_Presentacion_Semestral.docx`.

### 8.1 Portada (texto EXACTO, primera página, centrado, salto de página después)
```
UNIVERSIDAD TECNOLÓGICA DE PANAMÁ
FACULTAD DE INGENIERÍA DE SISTEMAS COMPUTACIONALES
DESARROLLO Y GESTIÓN DE SOFTWARE
INNOVACIÓN Y EMPRENDIMIENTO
CASO DE INNOVACIÓN

Grupo: 1GS241

Estudiantes:
   He, Kelvin — 8-999-1950
   Barrera, Roy — 8-1022-2121
   Mosquera, Einer — 8-924-1880
   Athanasidis, Nicolás — 8-1001-974

Profe: Melvin Falcón

Fecha: 29/5/2026
```

### 8.2 Índice automático (TOC de Word)

### 8.3 Estructura de secciones (CONFIRMADA por el cliente)
1. **Quiénes somos — la startup** (visión, misión, nombre, slogan)
2. **Organigrama** del equipo: **CEO** (Kelvin He), **Backend** (Roy Barrera), **Frontend** (Einer Mosquera), **QA** (Nicolás Athanasidis)
3. **Problemas que resuelve nuestro producto**
4. **El software** que vamos a lanzar/construir (apoyándonos en otros productos: Groq, Clerk, Stripe, ChromaDB, sentence-transformers, Tesseract)
5. **Landing page**
6. **Demostración**
7. **Cómo funciona el software:** modelos de IA + stack técnico (incluye **OCR** y **Auth/Pagos Clerk-Stripe**)
8. **Mercado objetivo** (TAM/SAM/SOM, segmentación, buyer persona)
9. **Competencias** (matriz comparativa, ventaja diferencial)
10. **Modelo de negocio:** planes de cobro y suscripción (Free / Starter / Business / Enterprise)
11. **Marketing:** validación, adquisición, alianzas, escalamiento
12. **Objetivos de crecimiento:** corto plazo, mediano plazo, largo plazo
13. **Finanzas:** proyección a 3 años (ingresos, costos, utilidad, break-even)
14. **Conclusión**
15. **Costos que conlleva la startup — Activos** (activos fijos, intangibles, capital de trabajo) → sección clave **porque vamos a vender la idea/negocio**
+ **Referencias** + **Anexos**

> El texto de cada sección ya está en `Contexto/` (PRD v3 §B y PRD v4 §N). El script lo vierte con estilos, tablas (precios, TAM/SAM/SOM, finanzas, competencia) y el organigrama.

**Criterios:** `.docx` abre en Word con portada centrada, índice/TOC, encabezados estilados, tablas y organigrama.

---

## FASE 9 — Pitch Deck (.pptx) · ⏱️ ~3-4 h

**Objetivo:** `docs/generate_pptx.py` (python-pptx) → `DocuMind_Pitch_Deck.pptx`, 15 slides (v4 §N.3), diseño oscuro futurista (slate + violet/emerald), con gráficas (finanzas), matriz competitiva, organigrama y placeholder de QR a la demo.

### 9.1 Integrantes (slide 1 portada + slide 12 equipo) — texto EXACTO
```
Grupo 1GS241 · UTP · Innovación y Emprendimiento · Prof. Melvin Falcón · 29/5/2026

He, Kelvin        — 8-999-1950   — CEO (visión, estrategia, pitch)
Barrera, Roy      — 8-1022-2121  — Backend Lead (FastAPI, RAG, OCR)
Mosquera, Einer   — 8-924-1880   — Frontend Lead (Next.js, shadcn/ui)
Athanasidis, Nicolás — 8-1001-974 — QA / Documentación
```

| # | Slide | # | Slide |
|---|-------|---|-------|
| 1 | Portada (logo, slogan, equipo) | 9 | Modelo de negocio + Stripe |
| 2 | Problema | 10 | Tracción (waitlist) |
| 3 | Solución | 11 | Finanzas (break-even mes 10) |
| 4 | Demo (screenshot chat) | 12 | Equipo (organigrama) |
| 5 | Tecnología (stack + OCR + Groq) | 13 | Roadmap |
| 6 | Producto (features) | 14 | Inversión ($4,100; LTV/CAC=28.8) |
| 7 | Mercado (TAM/SAM/SOM) | 15 | CTA + QR |
| 8 | Competencia (matriz) | | |

**Criterios:** `.pptx` abre en PowerPoint con 15 slides legibles y consistentes.

---

## FASE 10 — README + ensayo de demo · ⏱️ ~2-3 h

**Objetivo:** `README.md` con setup paso a paso (clonar, `.env`, instalar Tesseract/Poppler, Clerk/Stripe/Groq, comandos de arranque) y **guion de demo de 3 min** (v4 §O.1):

1. Landing (15s) → 2. Login Clerk (10s) → 3. Dashboard 7 docs (20s) → 4. Subir imagen con OCR (30s) → 5. Chat 3 preguntas con citas (90s) → 6. Búsqueda semántica (20s) → 7. **Free vs Pago en vivo** con Stripe (15s) → 8. Cierre (10s).

**Comandos de arranque (2 terminales):**
```bash
# Terminal 1 — Backend
cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000
# Terminal 2 — Frontend
pnpm dev
```

**Criterios:** alguien externo levanta el proyecto solo con el README; ensayo de 3 min sin fallos.

---

## 6. RESUMEN DE TIEMPOS (mapeo a 7 días)

| Día | Fases | Foco |
|-----|-------|------|
| 1 | 0 | Setup completo (entornos, Tesseract/Poppler, cuentas) |
| 2 | 1 | Backend RAG + OCR + 4 endpoints (verificado en /docs) |
| 3 | 2 + 3 | Auth Clerk + Landing futurista |
| 4 | 4 | App autenticada + integración con backend |
| 5 | 5 + 6 | Stripe + gating Free/Pago + polish |
| 6 | 7 | Documentos demo + seed (verificar las 12 preguntas) |
| 7 | 8 + 9 + 10 | Word + Pitch + README + ensayo |

---

## 7. CHECKLIST FINAL (demo-ready)

- [ ] `pnpm dev` + `uvicorn --reload` levantan sin Docker.
- [ ] FastAPI expone **exactamente 4** endpoints funcionales.
- [ ] Groq responde; sin Groq → extractivo (la app nunca se cae).
- [ ] OCR funciona (imagen + PDF escaneado) con confianza visible.
- [ ] Clerk: signup/login real; plan en `publicMetadata`.
- [ ] Stripe test: pago 4242… sube Free→Starter en vivo (sin ngrok).
- [ ] Gating: Free topa 3 docs y bloquea OCR; Pago desbloquea.
- [ ] 7 documentos demo se auto-cargan; 12 preguntas correctas.
- [ ] Landing responsive y animada.
- [ ] `.docx` y `.pptx` generados en `docs/`.
- [ ] README con guion de demo de 3 minutos.

---

## 8. NOTAS / RIESGOS

- **Primera carga de embeddings:** `all-MiniLM-L6-v2` (~22MB) se descarga la 1.ª vez → hacerlo antes del demo (sin internet en vivo, ya queda en caché).
- **Tesseract/Poppler en PATH:** si OCR falla, revisar `TESSERACT_CMD` y `POPPLER_PATH` en `backend/.env`.
- **Plan en Clerk no refresca:** tras pagar, llamar `user.reload()` en `/billing`.
- **Groq rate limit (30/min):** suficiente para demo; el extractivo cubre cualquier corte.
- **Webhooks (opcional, post-demo):** si luego quieres robustez de producción, añadir `/api/stripe/webhook` + ngrok; no es necesario ahora.
- **Aislamiento por usuario:** para el demo los 7 documentos son globales (compartidos). El gating Free/Pago sí es por usuario (Clerk). Multi-tenant real = roadmap.

---

*Fin de plan.md — listo para ejecutar fase por fase en las siguientes iteraciones.*
