# DocuMind AI

**El cerebro digital de tu empresa.** Plataforma SaaS RAG (Retrieval-Augmented Generation) que permite subir documentos empresariales (PDF, imágenes), hacerles preguntas en lenguaje natural y obtener respuestas con citas de fuente exacta.

> Proyecto Semestral — Innovación y Emprendimiento · Grupo 1GS241 · UTP · Prof. Melvin Falcón
> He, Kelvin (8-999-1950) · Barrera, Roy (8-1022-2121) · Mosquera, Einer (8-924-1880) · Athanasidis, Nicolás (8-1001-974)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 · React 18 · TypeScript · Tailwind v4 · shadcn/ui (Base UI) |
| Auth | Clerk 7 (cuentas reales, plan en `publicMetadata`) |
| Pagos | Stripe 22 (test mode, sin webhooks — verificación por redirect) |
| Backend AI | FastAPI 0.138 · ChromaDB 1.5 · Groq (`llama-3.1-8b-instant`) |
| OCR | Tesseract + pdf2image + Pillow |
| Embeddings | `all-MiniLM-L6-v2` vía ChromaDB ONNX (sin PyTorch) |
| Animaciones | Framer Motion 12 · Recharts 3 |

---

## Requisitos del sistema

### Node / pnpm
```bash
node -v   # >= 18 (probado con Node 22)
pnpm -v   # >= 9  (instalar: npm i -g pnpm)
```

### Python
```bash
python --version   # 3.11 recomendado (probado con 3.11.9)
```

### Tesseract OCR (Windows — necesario para OCR)
1. Descargar instalador desde https://github.com/UB-Mannheim/tesseract/wiki
2. Durante la instalación marcar el idioma **Spanish**
3. Ruta por defecto: `C:\Program Files\Tesseract-OCR\tesseract.exe`
4. Verificar: `tesseract --version`

### Poppler (Windows — necesario para pdf2image/OCR en PDFs)
1. Descargar desde https://github.com/oschwartz10612/poppler-windows/releases
2. Descomprimir en `C:\poppler`
3. Verificar desde `C:\poppler\Library\bin`: `pdfinfo -v`

> Si no instalas Tesseract/Poppler, los PDFs de texto funcionan igual. Solo el OCR (imágenes y PDFs escaneados) requiere ambos.

---

## Setup paso a paso

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd "DocuMind AI"
```

### 2. Variables de entorno — Frontend

```bash
# Windows PowerShell
Copy-Item .env.example .env.local
# o simplemente copia el archivo manualmente
```

Abrir `.env.local` y completar:

```ini
# Clerk (https://dashboard.clerk.com → nueva app → Email + Google OAuth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe modo test (https://dashboard.stripe.com → crear 3 productos)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_STARTER=price_...       # Starter $49/mes
STRIPE_PRICE_BUSINESS=price_...      # Business $199/mes
STRIPE_PRICE_ENTERPRISE=price_...    # Enterprise $999/mes

# (Los demás valores ya vienen bien en .env.example)
```

> **Modo keyless:** Si dejas las keys de Clerk vacías, la app corre sin auth real (útil para probar UI localmente).

### 3. Variables de entorno — Backend

```bash
Copy-Item backend\.env.example backend\.env
```

Abrir `backend/.env` y completar:

```ini
# Groq — https://console.groq.com (si está vacío: modo extractivo automático)
GROQ_API_KEY=gsk_...

# Paths OCR (ajustar a tu instalación)
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
POPPLER_PATH=C:\poppler\Library\bin
```

### 4. Instalar dependencias — Frontend

```bash
pnpm install
```

### 5. Instalar dependencias — Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1       # PowerShell
# o: venv\Scripts\activate      # cmd
pip install -r requirements.txt
cd ..
```

> La primera ejecución descarga el modelo `all-MiniLM-L6-v2` (~22 MB) para embeddings. Hazlo antes del demo para que quede en caché local.

---

## Arrancar la aplicación

Necesitas **dos terminales abiertas en simultáneo**:

**Terminal 1 — Backend (FastAPI):**
```powershell
cd backend
venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

Al iniciar:
- Se crean las tablas SQLite automáticamente
- Se **auto-cargan los 7 documentos demo** de Constructora Nova S.A. si la base está vacía
- Swagger disponible en: http://localhost:8000/docs

**Terminal 2 — Frontend (Next.js):**
```bash
pnpm dev
```

Abrir: http://localhost:3000

---

## Cuentas externas

### Groq (LLM gratuito)
1. Registrarse en https://console.groq.com
2. Crear API Key → pegar en `backend/.env` como `GROQ_API_KEY`
3. Límite: 30 req/min gratis — suficiente para cualquier demo
4. Sin key: la app usa **modo extractivo** automáticamente (nunca se cae)

### Clerk (Auth)
1. Crear cuenta en https://clerk.com → nueva aplicación
2. Activar proveedores: **Email** y **Google**
3. Copiar `Publishable Key` y `Secret Key` → `.env.local`

### Stripe (Pagos, modo test)
1. Crear cuenta en https://stripe.com → activar **Test mode**
2. Ir a Products → crear 3 productos con precio recurrente mensual:
   - **DocuMind Starter** — $49/mes
   - **DocuMind Business** — $199/mes
   - **DocuMind Enterprise** — $999/mes
3. Copiar los `price_xxx` de cada producto → `.env.local`
4. Tarjeta de prueba: `4242 4242 4242 4242` · fecha futura · CVC cualquiera

---

## Los 4 endpoints de FastAPI

| # | Método | Ruta | Descripción |
|---|--------|------|-------------|
| 1 | `POST` | `/documents/upload` | Sube archivo, extrae texto (OCR si aplica), fragmenta e indexa en ChromaDB |
| 2 | `GET` | `/documents` | Lista todos los documentos indexados con metadata |
| 3 | `POST` | `/chat` | RAG: `mode=chat` (Groq+extractivo) o `mode=search` (solo chunks con score) |
| 4 | `GET` | `/metrics` | Métricas del dashboard (docs, chunks, queries, actividad) |

> `GET /` → `{"status":"ok"}` (health check, no cuenta como uno de los 4)

Documentación interactiva: http://localhost:8000/docs

---

## Flujo de pagos (sin webhooks ni ngrok)

1. Usuario Free llega al límite (3 docs o intenta subir imagen) → `UpgradeDialog` → `/pricing`
2. Clic "Elegir Starter" → `POST /api/stripe/checkout` → Stripe Checkout (hosted)
3. Ingresa tarjeta `4242 4242 4242 4242` → pago exitoso → redirige a `/billing?session_id=...&plan=starter`
4. La página `/billing` detecta los params → `POST /api/stripe/confirm` → verifica pago con Stripe → actualiza `publicMetadata.plan` en Clerk → `user.reload()` → **plan sube en tiempo real, sin recargar**

---

## Documentos demo — Constructora Nova S.A.

Los 7 documentos se generan con `backend/scripts/generate_demo_docs.py` y se indexan automáticamente al iniciar el backend:

| ID | Archivo | Tipo | Contenido demo |
|----|---------|------|----------------|
| 001 | Contrato_Laboral_Nova_2026.pdf | pdf_text | Preaviso 30 días · seguro médico 100% emergencias |
| 002 | Manual_RRHH_Nova.pdf | pdf_text | Horario L-V 8am-5pm · 17 días vacaciones a 2 años · causales de despido |
| 003 | Reglamento_Interno_Nova.pdf | pdf_text | Renuncia sin preaviso → pérdida de beneficios |
| 004 | Contrato_Arrendamiento_Oficina.pdf | pdf_text | Plazo 24 meses · canon $3,500/mes |
| 005 | Politica_Compras_Proveedores.pdf | pdf_text | 3 cotizaciones obligatorias >$500 · aprobación GG+Finanzas >$3,000 |
| 006 | Acta_Reunion_Directiva_Nova.jpg | image_ocr | Acta con presupuesto (texto en imagen) |
| 007 | Factura_Servicios_Enero_2026.pdf | pdf_ocr | Factura escaneada con monto a pagar |

Para regenerar los documentos demo:
```bash
cd backend
venv\Scripts\Activate.ps1
python scripts/generate_demo_docs.py
```

Para reiniciar desde cero (re-seed):
```powershell
# Detener uvicorn, luego:
Remove-Item -Recurse -Force backend\data
# Reiniciar uvicorn → auto-seed automático
```

---

## Guion de demo (~3 minutos)

> Preparar antes: backend y frontend corriendo, browser en http://localhost:3000, usuario Free (sin docs subidos aún o con datos limpios).

| Tiempo | Paso | Acción | Mensaje clave |
|--------|------|--------|---------------|
| 0:00–0:15 | **1. Landing** | Mostrar `/` — Hero, Features, Pricing | "Esta es la landing de DocuMind AI. Nótese el diseño oscuro, las animaciones y los 4 planes de suscripción." |
| 0:15–0:25 | **2. Login Clerk** | Clic en "Empezar gratis" → `/sign-up` → cuenta real | "Registro real con Clerk. En segundos tenemos sesión activa." |
| 0:25–0:45 | **3. Dashboard** | Mostrar `/dashboard` con 7 docs auto-cargados | "7 documentos de Constructora Nova S.A. se indexaron solos al arrancar el backend." |
| 0:45–1:15 | **4. Upload OCR** | Ir a `/upload` → arrastrar `Acta_Reunion.jpg` → ver confianza OCR y chunks | "Subimos una imagen. El backend detecta que no hay texto → OCR automático con Tesseract → fragmenta e indexa." |
| 1:15–2:45 | **5. Chat con citas** | Ir a `/chat` → hacer 3 preguntas | Ver respuestas con citas clickeables y página exacta |
| 2:45–3:05 | **6. Búsqueda semántica** | Ir a `/search` → buscar "preaviso renuncia" | "Búsqueda semántica pura — devuelve los chunks con score de relevancia." |
| 3:05–3:20 | **7. Free vs Pago** | Intentar subir 4.º doc → UpgradeDialog → `/pricing` → Stripe 4242… → plan sube | "En vivo: límite Free → pago con Stripe → plan actualizado instantáneamente." |
| 3:20–3:30 | **8. Cierre** | Volver al dashboard actualizado | "Ahora tiene docs ilimitados y OCR desbloqueado. Esto es DocuMind AI." |

### Las 12 preguntas del demo (para el paso de Chat):

Para el demo usa 3 de estas 12; las demás confirman que el sistema responde correctamente:

1. ¿Cuántos días de preaviso se necesitan para renunciar?
2. ¿Cuál es el horario laboral de Nova S.A.?
3. ¿Cuántos días de vacaciones hay después de 2 años de trabajo?
4. ¿Cuál es el canon de arrendamiento de la oficina?
5. ¿Cuántas cotizaciones se necesitan para compras mayores a $500?
6. ¿Qué cubre el seguro médico según el contrato laboral?
7. ¿Cuáles son las causales de despido en el reglamento interno?
8. ¿Qué pasa si renuncio sin dar el preaviso?
9. ¿Cuánto tiempo dura el contrato de arrendamiento de la oficina?
10. ¿Quién debe aprobar las compras mayores a $3,000?
11. ¿Cuál fue el presupuesto discutido en el acta de directiva?
12. ¿Cuál es el monto total a pagar de la factura de enero 2026?

---

## Entregables

| Archivo | Descripción |
|---------|-------------|
| `docs/DocuMind_Presentacion_Semestral.docx` | Documento Word con portada, índice, 15 secciones (startup, producto, mercado, finanzas, etc.) |
| `docs/DocuMind_Pitch_Deck.pptx` | Pitch Deck 15 slides, diseño oscuro futurista |
| `docs/generate_word.py` | Script que genera el `.docx` con python-docx |
| `docs/generate_pptx.py` | Script que genera el `.pptx` con python-pptx |

Para regenerar los entregables:
```bash
cd docs
python generate_word.py    # genera DocuMind_Presentacion_Semestral.docx
python generate_pptx.py    # genera DocuMind_Pitch_Deck.pptx
```

---

## Troubleshooting

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| `tesseract: command not found` | Tesseract no instalado o no en PATH | Instalar desde UB-Mannheim; verificar `TESSERACT_CMD` en `backend/.env` |
| `pdfinfo: command not found` | Poppler no instalado o no en PATH | Descomprimir en `C:\poppler`; verificar `POPPLER_PATH` en `backend/.env` |
| OCR funciona pero texto sale con errores | DPI bajo o imagen de mala calidad | Aumentar `OCR_DPI=300` en `backend/.env` |
| Groq devuelve error 429 | Rate limit (30 req/min) | Esperar 1 min; la app cae automáticamente a modo extractivo |
| Puerto 3000 ocupado | Otra app en el puerto | Next.js usa 3001 automáticamente; actualizar `NEXT_PUBLIC_APP_URL` si fuera necesario |
| Plan no se actualiza tras pago | `user.reload()` no ejecutado | Recargar `/billing` manualmente; verificar que `STRIPE_SECRET_KEY` sea el de modo **test** |
| ChromaDB sin datos tras reiniciar | `data/` fue borrado | Detener uvicorn → iniciar de nuevo → seed automático vuelve a cargar los 7 docs |
| `pnpm install` pide confirmar builds | pnpm 11 requiere aprobación explícita | Ejecutar `CI=true pnpm install` |

---

## Estructura del proyecto

```
DocuMind AI/
├── src/
│   ├── app/                     ← Next.js App Router
│   │   ├── page.tsx             ← Landing (/)
│   │   ├── dashboard/           ← Métricas + docs recientes
│   │   ├── chat/                ← Chat RAG con citas
│   │   ├── documents/           ← Tabla de documentos
│   │   ├── upload/              ← Dropzone con progreso OCR
│   │   ├── search/              ← Búsqueda semántica
│   │   ├── billing/             ← Plan actual + confirmar pago
│   │   ├── pricing/             ← 4 planes + Stripe Checkout
│   │   └── api/
│   │       ├── stripe/checkout/ ← Crea Checkout Session
│   │       ├── stripe/confirm/  ← Verifica pago → sube plan Clerk
│   │       └── proxy/[...path]/ ← Proxy a FastAPI + gating Free/Pago
│   ├── components/
│   │   ├── landing/             ← 11 componentes (Navbar, Hero, ...)
│   │   ├── app/                 ← AppShell, ChatInterface, UploadDropzone...
│   │   └── ui/                  ← shadcn/ui (Base UI)
│   ├── hooks/                   ← useDocuments, useChat, useUpload, usePlan
│   └── lib/                     ← api.ts, plans.ts, stripe.ts, utils.ts
├── backend/
│   ├── main.py                  ← FastAPI + CORS + seed al startup
│   ├── api/                     ← documents.py, chat.py, metrics.py
│   ├── core/                    ← config.py (Settings), database.py (SQLite)
│   ├── services/                ← rag_pipeline.py, ocr_service.py, vector_store.py, llm_service.py
│   ├── models/schemas.py        ← Pydantic schemas
│   └── scripts/
│       └── generate_demo_docs.py ← Genera los 7 docs de Constructora Nova S.A.
└── docs/
    ├── generate_word.py
    ├── generate_pptx.py
    ├── DocuMind_Presentacion_Semestral.docx
    └── DocuMind_Pitch_Deck.pptx
```

---

## Fases implementadas

- [x] **Fase 0** — Setup (Next.js + FastAPI + Tesseract/Poppler + cuentas externas)
- [x] **Fase 1** — Backend RAG + OCR + 4 endpoints
- [x] **Fase 2** — Auth Clerk + middleware + AppShell
- [x] **Fase 3** — Landing page futurista (animada, responsive)
- [x] **Fase 4** — App autenticada + proxy + 6 páginas integradas con backend
- [x] **Fase 5** — Stripe: checkout + confirm + gating Free/Pago
- [x] **Fase 6** — Polish: empty states, toasts, timeouts, preguntas sugeridas, responsive
- [x] **Fase 7** — 7 documentos demo de Nova S.A. + seed automático al startup
- [x] **Fase 8** — Documento Word (.docx) con portada, TOC y 15 secciones
- [x] **Fase 9** — Pitch Deck (.pptx) con 15 slides, diseño oscuro futurista
- [x] **Fase 10** — README final + guion de demo

---

*DocuMind AI — Grupo 1GS241 · UTP · Innovación y Emprendimiento · Prof. Melvin Falcón · 29/05/2026*
