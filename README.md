# DocuMind AI

**El cerebro digital de tu empresa.** Plataforma SaaS RAG (Retrieval-Augmented Generation) que permite subir documentos empresariales (PDF, imágenes), hacerles preguntas en lenguaje natural y obtener respuestas con citas de fuente.

> Proyecto Semestral — Innovación y Emprendimiento · Grupo 1GS241 · UTP · Prof. Melvin Falcón  
> He, Kelvin · Barrera, Roy · Mosquera, Einer · Athanasidis, Nicolás

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 · React 18 · TypeScript · Tailwind v4 · shadcn/ui |
| Auth | Clerk (cuentas reales, plan en `publicMetadata`) |
| Pagos | Stripe (test mode, sin webhooks) |
| Backend AI | FastAPI · ChromaDB · Groq (`llama-3.1-8b-instant`) |
| OCR | Tesseract + pdf2image + Pillow |
| Embeddings | `all-MiniLM-L6-v2` vía ChromaDB ONNX (sin PyTorch) |

---

## Requisitos previos

### Node / pnpm
```bash
node -v   # >= 18
pnpm -v   # >= 9  (instalar: npm i -g pnpm)
```

### Python
```bash
python --version   # 3.11 recomendado
```

### Tesseract OCR (Windows)
1. Descargar instalador desde https://github.com/UB-Mannheim/tesseract/wiki
2. Durante la instalación, marcar el idioma **Spanish**
3. Anotar la ruta de instalación (por defecto `C:\Program Files\Tesseract-OCR\tesseract.exe`)
4. Verificar: `tesseract --version`

### Poppler (para pdf2image, Windows)
1. Descargar desde https://github.com/oschwartz10612/poppler-windows/releases
2. Descomprimir en `C:\poppler`
3. Verificar: `pdfinfo -v` (desde `C:\poppler\Library\bin`)

---

## Setup

### 1. Clonar y variables de entorno

```bash
git clone <repo-url>
cd "DocuMind AI"
```

**Frontend** — copiar y completar:
```bash
cp .env.example .env.local
```

Editar `.env.local`:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` → desde https://dashboard.clerk.com
- `STRIPE_SECRET_KEY` + `STRIPE_PRICE_*` → desde https://dashboard.stripe.com (modo test)

> **Modo keyless:** Si dejas las keys de Clerk vacías/comentadas, la app corre en modo de desarrollo sin auth real (útil para probar UI).

**Backend** — copiar y completar:
```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env`:
- `GROQ_API_KEY` → desde https://console.groq.com  
  *(Si está vacío, la app usa modo extractivo automáticamente — nunca se cae)*
- `TESSERACT_CMD` → ruta a tu instalación de Tesseract
- `POPPLER_PATH` → ruta a la carpeta `bin` de Poppler

### 2. Instalar dependencias frontend

```bash
pnpm install
```

### 3. Instalar dependencias backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # PowerShell: venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

> La primera ejecución descarga el modelo de embeddings `all-MiniLM-L6-v2` (~22 MB). Hazlo antes del demo para que quede en caché.

---

## Arrancar la aplicación

Necesitas **dos terminales**:

**Terminal 1 — Backend (FastAPI):**
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

Al iniciar, se auto-cargan los **7 documentos demo** de Constructora Nova S.A. si la base de datos está vacía.  
Swagger disponible en: http://localhost:8000/docs

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
3. Límite: 30 req/min (suficiente para demo)

### Clerk (Auth)
1. Crear cuenta en https://clerk.com → nueva aplicación
2. Activar proveedores: **Email** y **Google**
3. Copiar `Publishable Key` y `Secret Key` → `.env.local`

### Stripe (Pagos, modo test)
1. Crear cuenta en https://stripe.com → modo **Test**
2. Crear 3 productos con precio recurrente mensual:
   - **DocuMind Starter** — $49/mes
   - **DocuMind Business** — $199/mes
   - **DocuMind Enterprise** — $999/mes
3. Copiar los `price_xxx` → `.env.local` como `STRIPE_PRICE_STARTER`, etc.
4. Tarjeta de prueba: `4242 4242 4242 4242`, fecha futura, CVC cualquiera

---

## Los 4 endpoints de FastAPI

| # | Método | Ruta | Descripción |
|---|--------|------|-------------|
| 1 | `POST` | `/documents/upload` | Sube archivo, extrae texto (OCR si aplica), fragmenta e indexa |
| 2 | `GET` | `/documents` | Lista todos los documentos indexados |
| 3 | `POST` | `/chat` | RAG: `mode=chat` (Groq) o `mode=search` (solo chunks) |
| 4 | `GET` | `/metrics` | Métricas del dashboard |

> `GET /` → health check `{"status":"ok"}` (no cuenta como endpoint)

---

## Flujo de pagos (sin webhooks)

1. Usuario Free llega al límite → `UpgradeDialog` → `/pricing`
2. Clic en "Elegir Starter" → `POST /api/stripe/checkout` → Stripe Checkout
3. Tarjeta `4242 4242 4242 4242` → pago exitoso → redirige a `/billing?session_id=...&plan=starter`
4. `/billing` detecta params → `POST /api/stripe/confirm` → verifica pago → actualiza plan en Clerk → `user.reload()` → plan sube **en tiempo real**

---

## Guion de demo (3 minutos)

| Tiempo | Acción |
|--------|--------|
| 0:00–0:15 | Landing (`/`) — Hero, Features, Pricing |
| 0:15–0:25 | Login con Clerk → Dashboard con 7 docs auto-cargados |
| 0:25–0:55 | Subir imagen JPG con OCR → ver confianza y chunks |
| 0:55–2:25 | Chat → 3 preguntas con citas clickeables |
| 2:25–2:45 | Búsqueda semántica → score de relevancia |
| 2:45–3:00 | Límite Free → UpgradeDialog → Stripe → plan sube en vivo |

**Las 12 preguntas del demo (Nova S.A.):**
1. ¿Cuántos días de preaviso se necesitan para renunciar?
2. ¿Cuál es el horario laboral de Nova S.A.?
3. ¿Cuántos días de vacaciones hay después de 2 años?
4. ¿Cuál es el canon de arrendamiento de la oficina?
5. ¿Cuántas cotizaciones se necesitan para compras mayores a $500?
6. ¿Qué cubre el seguro médico según el contrato?
7. ¿Cuáles son las causales de despido en el reglamento?
8. ¿Qué pasa si renuncio sin dar preaviso?
9. ¿Cuánto tiempo dura el contrato de arrendamiento de la oficina?
10. ¿Quién debe aprobar las compras mayores a $3,000?
11. ¿Cuál fue el presupuesto discutido en el acta de directiva?
12. ¿Cuál es el monto total a pagar de la factura de enero 2026?

---

## Fases implementadas

- [x] **Fase 0** — Setup (Next.js + FastAPI + Tesseract/Poppler + cuentas)
- [x] **Fase 1** — Backend RAG + OCR + 4 endpoints
- [x] **Fase 2** — Auth Clerk + middleware + AppShell
- [x] **Fase 3** — Landing page futurista
- [x] **Fase 4** — App autenticada + proxy + 6 páginas integradas
- [x] **Fase 5** — Stripe: checkout + confirm + gating Free/Pago
- [x] **Fase 6** — Polish: empty states, timeouts, 12 preguntas, responsive
- [ ] **Fase 7** — Documentos demo + seed automático
- [ ] **Fase 8** — Documento Word (.docx)
- [ ] **Fase 9** — Pitch Deck (.pptx)
- [ ] **Fase 10** — README final + ensayo de demo
