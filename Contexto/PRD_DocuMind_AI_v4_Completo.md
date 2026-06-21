## SECCION A: INSTRUCCIONES PARA CLAUDE CODE

> **NOTA PARA CLAUDE CODE:** Este PRD contiene instrucciones explicitas para que generes los siguientes entregables. Todo debe estar integrado en una sola aplicacion Next.js 14 con App Router, donde la landing page y la aplicacion autenticada comparten el mismo proyecto. El backend AI (FastAPI) es un servicio separado que corre localmente.

### Entregables Requeridos:

1. **Aplicacion Next.js 14 Completa** (monorepo o carpeta unica):
   - `/` — Landing Page publica (futurista, SaaS)
   - `/app` — Aplicacion autenticada con Clerk (dashboard, chat, upload, busqueda)
   - `/api` — API Routes de Next.js para proxy a FastAPI + webhooks Stripe
   - Integracion Clerk (auth) + Stripe (payments) + shadcn/ui

2. **Backend FastAPI** (carpeta separada `backend/`):
   - Pipeline RAG completo
   - OCR para PDFs con imagenes e imagenes directas
   - API REST con documentacion automatica
   - Integracion con Groq (LLM) + ChromaDB (vectores) + SQLite (metadata)

3. **Documento Word** (.docx) de la Presentacion Semestral
4. **Pitch Deck** (PPT o Google Slides)
5. **README completo** con instrucciones de setup paso a paso

---

## SECCION B: ARQUITECTURA DEL SISTEMA COMPLETO

### B.1 Vision de la Aplicacion Unificada

DocuMind AI es una **unica aplicacion Next.js 14** que combina Landing Page publica + App autenticada en el mismo proyecto.

**Arquitectura de alto nivel:**

```
NEXT.JS 14 APP (Puerto 3000)
|
|-- LANDING PAGE (Ruta: /) - Publica
|   |-- Hero, Features, Pricing, Testimonials, CTA
|   |-- NO requiere autenticacion
|
|-- APLICACION AUTENTICADA (Rutas protegidas: /dashboard, /chat, etc.)
|   |-- Dashboard, Chat RAG, Upload, Documents, Search, Billing
|   |-- Protegida por Clerk Middleware
|
|-- API ROUTES (/api/*)
    |-- /api/auth/*       -> Clerk (login, logout, sesiones)
    |-- /api/stripe/*     -> Webhooks Stripe (checkout, subscriptions)
    |-- /api/proxy/*      -> Proxy a FastAPI (documentos, chat, search)

BACKEND FASTAPI (Puerto 8000)
|
|-- API REST
|   |-- POST /documents/upload  -> Guarda + indexa PDF/imagen
|   |-- GET  /documents         -> Lista documentos
|   |-- POST /chat              -> RAG + respuesta con citas
|   |-- GET  /search            -> Busqueda semantica
|   |-- GET  /metrics           -> Metricas del sistema
|
|-- PIPELINE RAG
|   |-- 1. Extraccion (PDF texto / OCR)
|   |-- 2. Chunking (LangChain)
|   |-- 3. Embeddings (all-MiniLM-L6-v2)
|   |-- 4. Indexacion (ChromaDB)
|   |-- 5. Retrieval (similitud coseno)
|   |-- 6. Generation (Groq API - Llama 3.1 8B)
|
|-- OCR ENGINE
    |-- PDF con texto plano    -> pymupdf (directo)
    |-- PDF escaneado          -> pdf2image + pytesseract
    |-- Imagen directa         -> Pillow + pytesseract
```

### B.2 Flujo de Autenticacion (Clerk)

1. Usuario visita `/` -> Landing Page (publica)
2. Usuario hace clic en "Empezar gratis" o "Iniciar sesion"
3. Clerk redirige a `/sign-in` o `/sign-up` (componentes de Clerk)
4. Autenticacion exitosa -> Clerk crea sesion JWT
5. Middleware de Next.js verifica sesion en rutas protegidas
6. Frontend incluye token JWT en headers de cada request a `/api/proxy/*`
7. FastAPI valida JWT (opcional para demo) o confia en proxy de Next.js

### B.3 Flujo de Pagos (Stripe)

1. Usuario autenticado va a `/billing` o `/pricing` (dentro de la app)
2. Selecciona plan (Starter $49, Business $199, Enterprise $999)
3. Frontend llama a `/api/stripe/create-checkout-session`
4. Stripe devuelve URL de checkout
5. Usuario paga en Stripe (modo test para demo - tarjeta 4242 4242 4242 4242)
6. Stripe envia webhook a `/api/stripe/webhook`
7. Webhook actualiza plan del usuario en SQLite (free -> starter -> business)
8. Middleware verifica rol para acceso a features premium

### B.4 Flujo de Subida de Archivos con OCR

1. Usuario arrastra archivo a `/upload`
2. Frontend detecta tipo: PDF o Imagen
3. Frontend envia archivo a `/api/proxy/documents/upload`
4. FastAPI recibe archivo y detecta tipo MIME
5. Si es PDF con texto plano -> pymupdf extrae texto directamente
6. Si es PDF con imagenes (escaneado) -> pdf2image convierte a imagenes -> pytesseract OCR -> texto
7. Si es imagen directa (JPG, PNG) -> pytesseract OCR -> texto
8. Texto extraido -> Limpieza -> Chunking -> Embeddings -> ChromaDB
9. Metadatos guardados en SQLite (filename, tipo, paginas, fecha, user_id)
10. Respuesta al frontend: {success, document_id, pages_processed, text_extracted}

---

## SECCION C: STACK TECNOLOGICO DETALLADO

### C.1 Frontend / Full-Stack (Next.js 14)

| Capa | Tecnologia | Version | Proposito |
|------|-----------|---------|-----------|
| Framework | Next.js 14 | 14.2.x | App Router, SSR, API Routes, monorepo unificado |
| Language | TypeScript | 5.4 | Tipado estatico |
| UI Library | React 18 | 18.3 | Componentes interactivos |
| Styling | Tailwind CSS | 3.4 | Estilos utilitarios, responsive |
| Components | shadcn/ui | latest | Dialog, Button, Card, Input, Tabs, Dropdown, Table, Sheet, Toast |
| Auth | @clerk/nextjs | 5.x | Autenticacion completa (login, signup, OAuth, MFA, sesiones) |
| Payments | stripe | 15.x | Checkout, subscriptions, webhooks |
| Animations | framer-motion | 11.x | Landing page animations, page transitions |
| Icons | lucide-react | latest | Iconografia moderna |
| Charts | recharts | 2.x | Dashboard metrics |
| Forms | react-hook-form | 7.x | Validacion de formularios |
| Validation | zod | 3.x | Schema validation (TypeScript-first) |
| HTTP Client | axios | 1.6 | Requests a FastAPI proxy |
| State | React Context + Zustand | latest | Estado global (usuario, plan, documentos) |
| Package Manager | pnpm | 8.x | Rapido, eficiente |

### C.2 Backend AI (FastAPI)

| Capa | Tecnologia | Version | Proposito |
|------|-----------|---------|-----------|
| Framework | FastAPI | 0.110.x | API REST async, auto-documentacion Swagger |
| Server | Uvicorn | 0.27.x | Servidor ASGI con hot reload |
| Validation | Pydantic | 2.6.x | Validacion de request/response |
| RAG | LangChain | 0.1.x | Pipeline ingestion, chunking, retrieval |
| Embeddings | sentence-transformers | 2.5.x | all-MiniLM-L6-v2 (local, 22MB, offline) |
| Vector DB | ChromaDB | 0.4.x | Almacenamiento y busqueda de vectores |
| LLM | Groq Python SDK | latest | Llama 3.1 8B Instant (gratis, 30 req/min) |
| PDF Texto | pymupdf | 1.23.x | Extraccion de texto plano con metadata de paginas |
| PDF Imagenes | pdf2image | 1.17.x | Conversion de PDF escaneado a imagenes |
| OCR | pytesseract | 0.3.x | Reconocimiento optico de caracteres (Tesseract) |
| OCR Alternativa | paddleocr | 2.7.x | OCR mas preciso para espanol (opcional) |
| Imagenes | Pillow | 10.x | Procesamiento de imagenes para OCR |
| Relational DB | SQLite | built-in | Metadata de documentos, chats, usuarios, suscripciones |
| Environment | python-dotenv | latest | Variables de entorno |
| CORS | python-multipart | latest | Manejo de archivos multipart |

### C.3 Infraestructura y Servicios Externos

| Servicio | Proposito | Costo Demo | URL |
|----------|-----------|------------|-----|
| **Clerk** | Autenticacion (login, OAuth Google/GitHub, MFA, sesiones) | Gratis (10,000 MAU) | https://clerk.com |
| **Stripe** | Pagos y suscripciones (modo test para demo) | Gratis (solo fees reales) | https://stripe.com |
| **Groq** | LLM generativo (Llama 3.1 8B Instant) | Gratis (30 req/min) | https://groq.com |
| **Vercel** | Hosting frontend (opcional, demo local) | Gratis (Hobby) | https://vercel.com |
| **Ngrok** | Exponer FastAPI local a internet (webhooks Stripe) | Gratis | https://ngrok.com |

---

## SECCION D: ESTRUCTURA DE CARPETAS DEL PROYECTO

```
documind-ai/
|
|-- README.md                           # Documentacion completa
|-- package.json                        # Dependencias Node.js
|-- pnpm-lock.yaml                      # Lockfile
|-- next.config.js                      # Configuracion Next.js
|-- tailwind.config.ts                  # Configuracion Tailwind
|-- tsconfig.json                       # Configuracion TypeScript
|-- .env.local                          # Variables de entorno (Clerk, Stripe, FastAPI)
|
|-- public/                             # Assets estaticos
|   |-- logo.svg
|   |-- hero-screenshot.png
|   |-- demo-video-placeholder.jpg
|   |-- fonts/
|
|-- src/
|   |-- app/                            # App Router (Next.js 14)
|   |   |-- layout.tsx                    # Root layout (ClerkProvider)
|   |   |-- page.tsx                      # LANDING PAGE (publica)
|   |   |-- globals.css                   # Estilos globales
|   |   |
|   |   |-- (auth)/                       # Grupo de rutas de auth (Clerk)
|   |   |   |-- sign-in/[[...sign-in]]/page.tsx
|   |   |   |-- sign-up/[[...sign-up]]/page.tsx
|   |   |
|   |   |-- (app)/                        # Grupo de rutas protegidas (middleware)
|   |   |   |-- layout.tsx                # Layout con sidebar/nav para app
|   |   |   |-- dashboard/page.tsx          # Dashboard principal
|   |   |   |-- chat/page.tsx               # Chat RAG
|   |   |   |-- documents/page.tsx          # Lista de documentos
|   |   |   |-- upload/page.tsx             # Subida de archivos
|   |   |   |-- search/page.tsx             # Busqueda semantica
|   |   |   |-- settings/page.tsx           # Configuracion de cuenta
|   |   |   |-- billing/page.tsx              # Facturacion y plan actual
|   |   |   |-- pricing/page.tsx              # Planes de precios (dentro de app)
|   |   |
|   |   |-- api/                          # API Routes de Next.js
|   |   |   |-- stripe/
|   |   |   |   |-- create-checkout-session/route.ts
|   |   |   |   |-- webhook/route.ts
|   |   |   |-- proxy/
|   |   |   |   |-- documents/route.ts
|   |   |   |   |-- chat/route.ts
|   |   |   |   |-- search/route.ts
|   |   |   |   |-- metrics/route.ts
|   |
|   |-- components/
|   |   |-- landing/                      # Componentes de Landing Page
|   |   |   |-- Hero.tsx
|   |   |   |-- Features.tsx
|   |   |   |-- DemoVideo.tsx
|   |   |   |-- Pricing.tsx
|   |   |   |-- Testimonials.tsx
|   |   |   |-- CTA.tsx
|   |   |   |-- Navbar.tsx
|   |   |   |-- Footer.tsx
|   |   |
|   |   |-- app/                          # Componentes de la App autenticada
|   |   |   |-- Sidebar.tsx
|   |   |   |-- Topbar.tsx
|   |   |   |-- ChatInterface.tsx
|   |   |   |-- DocumentList.tsx
|   |   |   |-- UploadDropzone.tsx
|   |   |   |-- SearchResults.tsx
|   |   |   |-- MetricsDashboard.tsx
|   |   |   |-- SourceCitations.tsx
|   |   |   |-- BillingCard.tsx
|   |   |
|   |   |-- ui/                           # Componentes shadcn/ui
|   |   |   |-- button.tsx
|   |   |   |-- card.tsx
|   |   |   |-- dialog.tsx
|   |   |   |-- input.tsx
|   |   |   |-- tabs.tsx
|   |   |   |-- table.tsx
|   |   |   |-- dropdown-menu.tsx
|   |   |   |-- sheet.tsx
|   |   |   |-- toast.tsx
|   |   |   |-- toaster.tsx
|   |   |   |-- progress.tsx
|   |   |   |-- badge.tsx
|   |   |   |-- avatar.tsx
|   |   |   |-- skeleton.tsx
|   |   |   |-- tooltip.tsx
|   |
|   |-- hooks/
|   |   |-- useAuth.ts
|   |   |-- useDocuments.ts
|   |   |-- useChat.ts
|   |   |-- useSubscription.ts
|   |   |-- useUpload.ts
|   |
|   |-- lib/
|   |   |-- utils.ts                      # cn() helper
|   |   |-- stripe.ts                     # Configuracion Stripe
|   |   |-- clerk.ts                      # Configuracion Clerk
|   |   |-- api.ts                        # Cliente HTTP para FastAPI
|   |
|   |-- types/
|   |   |-- document.ts
|   |   |-- chat.ts
|   |   |-- user.ts
|   |   |-- subscription.ts
|   |
|   |-- middleware.ts                     # Clerk middleware (proteccion de rutas)
|
|-- backend/                              # BACKEND FASTAPI (carpeta separada)
|   |-- main.py                           # Punto de entrada FastAPI
|   |-- requirements.txt                  # Dependencias Python
|   |-- .env                              # Variables de entorno (Groq, DB paths)
|   |
|   |-- api/
|   |   |-- __init__.py
|   |   |-- documents.py                  # Endpoints: upload, list, delete
|   |   |-- chat.py                       # Endpoint: chat RAG
|   |   |-- search.py                     # Endpoint: busqueda semantica
|   |   |-- metrics.py                    # Endpoint: metricas del sistema
|   |   |-- health.py                     # Endpoint: health check
|   |
|   |-- core/
|   |   |-- __init__.py
|   |   |-- config.py                     # Configuracion (Settings Pydantic)
|   |   |-- database.py                   # Conexion SQLite
|   |   |-- security.py                   # JWT validation (opcional)
|   |
|   |-- services/
|   |   |-- __init__.py
|   |   |-- rag_pipeline.py               # Pipeline completo RAG
|   |   |-- ocr_service.py                # Servicio OCR (PDF escaneado + imagenes)
|   |   |-- embedding_service.py          # Embeddings con sentence-transformers
|   |   |-- llm_service.py                # LLM con Groq API
|   |   |-- vector_store.py               # ChromaDB wrapper
|   |
|   |-- models/
|   |   |-- __init__.py
|   |   |-- document.py                   # Modelos Pydantic para documentos
|   |   |-- chat.py                       # Modelos Pydantic para chat
|   |   |-- user.py                       # Modelos Pydantic para usuarios
|   |
|   |-- data/                             # Datos persistentes (NO versionar)
|   |   |-- uploads/                      # Archivos PDF subidos
|   |   |-- chroma/                       # Base de datos vectorial
|   |   |-- documind.db                   # SQLite (metadata)
|   |   |-- demo/                         # Documentos demo precargados
|
|-- docs/                                 # Documentos del proyecto
|   |-- DocuMind_Presentacion_Semestral.docx
|   |-- DocuMind_Pitch_Deck.pptx
```

---

## SECCION E: TIPOS DE ARCHIVOS SOPORTADOS Y OCR

### E.1 Tabla de Tipos de Archivos Permitidos

| Tipo de Archivo | Extensiones | Procesamiento | OCR Requerido | Estado |
|-----------------|-------------|---------------|---------------|--------|
| **PDF con texto plano** | .pdf | pymupdf extrae texto directamente | NO | Implementado |
| **PDF escaneado (imagenes)** | .pdf | pdf2image -> pytesseract OCR | SI | Implementado |
| **PDF mixto (texto + imagenes)** | .pdf | pymupdf intenta texto primero, fallback a OCR por pagina | PARCIAL | Implementado |
| **Imagen (documento escaneado)** | .jpg, .jpeg, .png | pytesseract OCR directo | SI | Implementado |
| **Imagen (fotografia de documento)** | .jpg, .jpeg, .png | pytesseract OCR + preprocesamiento (grayscale, threshold) | SI | Implementado |
| **Documento Word** | .docx | python-docx (futuro) | NO | Roadmap |
| **Texto plano** | .txt | Lectura directa | NO | Roadmap |
| **Hoja de calculo** | .csv, .xlsx | pandas/openpyxl (futuro) | NO | Roadmap |

### E.2 Pipeline OCR Detallado

**Flujo completo de procesamiento de archivos:**

1. **ARCHIVO SUBIDO** -> Sistema detecta tipo (MIME + extension)

2. **Si es PDF:**
   - pymupdf intenta extraer texto primero
   - Si texto extraido > 100 caracteres -> clasifica como "PDF texto plano"
   - Si texto extraido < 100 caracteres -> clasifica como "PDF escaneado" -> OCR
   - Para PDF escaneado: pdf2image convierte cada pagina a imagen -> pytesseract OCR por pagina -> merge de texto

3. **Si es Imagen (JPG/PNG):**
   - Pillow carga la imagen
   - Preprocesamiento: grayscale, resize, threshold, denoise
   - pytesseract OCR extrae texto + confianza
   - Si confianza < 60% -> marca como "revisar"

4. **LIMPIEZA:**
   - Eliminar headers/footers repetitivos
   - Normalizar espacios multiples
   - Corregir saltos de linea excesivos
   - Marcar paginas con baja confianza OCR

5. **CHUNKING (LangChain):**
   - RecursiveCharacterTextSplitter
   - chunk_size = 1000 caracteres
   - chunk_overlap = 200 caracteres
   - separadores: [parrafo, linea, oracion, espacio]
   - metadata por chunk: filename, page, chunk_index, total_chunks, source_type, ocr_confidence

6. **EMBEDDINGS:**
   - Modelo: sentence-transformers/all-MiniLM-L6-v2
   - 22MB, 384 dimensiones, multilingue (espanol incluido)

7. **INDEXACION (ChromaDB):**
   - Coleccion: "documind_documents"
   - Documento: {id, embedding, metadata, text}
   - Metadata incluye: filename, page, source_type (pdf_text/pdf_ocr/image_ocr), ocr_confidence

### E.3 Prompt de Sistema Mejorado (con OCR awareness)

El prompt de sistema para Groq incluye una regla especial para documentos OCR:

- Regla 6: Si el texto proviene de OCR y parece tener errores (caracteres extranos), indicarlo suavemente al usuario con una nota.
- Esto aumenta la transparencia y confianza del usuario en el sistema.

---

## SECCION F: MODELO DE SUSCRIPCION CON STRIPE + CLERK

### F.1 Planes de Suscripcion

| Plan | Precio | Usuarios | Documentos | Almacenamiento | Features |
|------|--------|----------|------------|----------------|----------|
| **Free** | $0/mes | 1 | 3 | 50 MB | Chat basico, busqueda, 20 consultas/mes |
| **Starter** | $49/mes | 5 | Ilimitados | 5 GB | Todo Free + multi-workspace, analytics basico, soporte email, OCR basico |
| **Business** | $199/mes | 50 | Ilimitados | 100 GB | Todo Starter + API access, SSO, soporte prioritario, OCR avanzado |
| **Enterprise** | $999/mes | Ilimitados | Ilimitados | Ilimitado | Todo Business + on-premise, CSM dedicado, SLA 99.9%, custom integrations |

### F.2 Features por Plan (para la UI)

**Plan Free ($0):**
- Chat con documentos
- Busqueda semantica
- Citas de fuente
- Soporte por email (48h)
- Limite: 3 documentos, 50 MB, 20 consultas/mes
- SIN: OCR, imagenes, analytics avanzado, API, multi-workspace

**Plan Starter ($49/mes):**
- Todo lo de Free
- Documentos ilimitados
- OCR para PDFs escaneados
- Subida de imagenes (JPG, PNG)
- Multi-workspace (hasta 3)
- Analytics basico
- Soporte prioritario (24h)
- SIN: API access, SSO/SAML, CSM dedicado

**Plan Business ($199/mes):**
- Todo lo de Starter
- API access completo
- SSO/SAML
- Integraciones (Google Drive, Dropbox)
- OCR avanzado (PaddleOCR)
- Auditoria completa
- Soporte telefonico
- SIN: On-premise, CSM dedicado, SLA 99.9%

**Plan Enterprise ($999/mes):**
- Todo lo de Business
- On-premise deployment
- CSM dedicado
- SLA 99.9%
- Custom integrations (SAP, SharePoint)
- White-label opcional
- Capacitacion presencial

### F.3 Flujo de Upgrade/Downgrade

1. Usuario en /billing ve su plan actual y los disponibles
2. Hace clic en "Upgrade" o "Cambiar plan"
3. Frontend llama /api/stripe/create-checkout-session con {priceId, mode: 'subscription'}
4. Stripe devuelve URL de checkout
5. Usuario ingresa datos de tarjeta de prueba (4242 4242 4242 4242)
6. Pago exitoso -> Stripe redirige a /billing?success=true
7. Webhook de Stripe llega a /api/stripe/webhook
8. Backend actualiza plan del usuario en SQLite
9. Frontend refresca datos del usuario
10. Middleware permite/deniega acceso a features segun nuevo plan

### F.4 Middleware de Autorizacion por Plan

El middleware de Next.js (Clerk) verifica:
- Si el usuario esta autenticado para rutas protegidas
- Si el plan del usuario permite acceso a features premium
- Por ejemplo: plan Free no puede acceder a /upload si ya tiene 3 documentos
- Plan Free no puede subir imagenes (solo PDF texto)

---

## SECCION G: LANDING PAGE INTEGRADA

### G.1 Estructura de la Landing (Ruta: `/`)

La landing page es la pagina de inicio publica de la aplicacion. No requiere autenticacion.

**Secciones de la Landing:**

1. **Navbar** (fijo, transparente -> solido al scroll)
   - Logo + "DocuMind AI"
   - Links: Features, Pricing, Testimonials
   - Boton "Iniciar sesion" -> /sign-in
   - Boton "Empezar gratis" -> /sign-up

2. **HeroSection**
   - Badge: "Ahora con OCR para documentos escaneados"
   - H1: "El cerebro digital de tu empresa"
   - Subtitle: "Convierte PDFs, imagenes y documentos en conocimiento accionable con IA"
   - CTA Group: "Probar gratis" -> /sign-up (plan Free) | "Ver demo" -> scroll a DemoVideo
   - Screenshot flotante con animacion (mockup del chat)

3. **LogoCloud** (marcas ficticias panamenas que "usan" DocuMind)

4. **FeaturesSection** (6 tarjetas con iconos animados)
   - Busqueda semantica inteligente
   - Chat con citas exactas (archivo, pagina, parrafo)
   - OCR para PDFs escaneados e imagenes
   - Analytics de productividad
   - Multi-workspace y colaboracion
   - On-premise opcional (Enterprise)

5. **HowItWorksSection** (3 pasos)
   - 1. Sube tus documentos (PDF, JPG, PNG)
   - 2. Nuestra IA los procesa (OCR + Embeddings)
   - 3. Pregunta en lenguaje natural

6. **DemoVideoSection**
   - Placeholder de video con play button
   - "Ver demo de 3 minutos"

7. **PricingSection** (4 planes: Free, Starter, Business, Enterprise)
   - Toggle mensual/anual (ahorro 17%)
   - Tarjetas con features listadas
   - Botones "Elegir plan" -> /sign-up o /billing

8. **TestimonialsSection** (3 testimonios ficticios de Panama)
   - "Constructora Nova S.A."
   - "Bufete Legal Mendez & Asociados"
   - "Universidad del Pacifico"

9. **StatsSection** (numeros ficticios pero realistas)
   - "500+ documentos procesados"
   - "10,000+ preguntas respondidas"
   - "50+ empresas en waitlist"
   - "99.2% precision en citas"

10. **CTASection**
    - "Transforma tu empresa hoy"
    - Formulario de email (waitlist)
    - "Unirse a la lista de espera"

11. **Footer**
    - Links: Producto, Compania, Legal
    - Redes sociales (iconos)
    - "DocuMind AI (c) 2026"

### G.2 Diseno Visual de la Landing

- **Fondo:** gradiente de slate-950 a slate-900, con grid sutil de puntos
- **Acentos:** violet-500 (primario), emerald-500 (exito/CTA), amber-500 (OCR badge)
- **Tipografia:** Inter (sans-serif), font-display para titulos
- **Animaciones:** Framer Motion
  - Fade-in al scroll (Intersection Observer)
  - Slide-up en cards
  - Hover effects en botones (scale + glow)
- **Efectos especiales:**
  - Grid de fondo con animacion sutil
  - Glow violeta en elementos destacados
  - Glassmorphism en navbar y cards (backdrop-blur)
  - Gradient border en cards de pricing (plan recomendado)

---

## SECCION H: APLICACION AUTENTICADA (Rutas Protegidas)

### H.1 Layout de la App

La app autenticada tiene un layout con sidebar izquierda + topbar + area de contenido principal.

**Sidebar:**
- Logo (colapsable)
- Dashboard
- Chat
- Documentos
- Upload
- Busqueda
- Separador
- Billing
- Settings
- Separador
- Badge del plan actual (Free/Starter/Business/Enterprise)

**Topbar:**
- Toggle sidebar (mobile)
- Titulo de la pagina actual
- Barra de busqueda global
- Notificaciones
- Avatar del usuario (con dropdown: perfil, billing, logout)

### H.2 Paginas de la App

**Dashboard (`/dashboard`):**
- Metricas cards: Documentos indexados, Chunks generados, Consultas este mes, Almacenamiento usado
- Grafica de actividad (Recharts): consultas por dia/semana
- Lista de documentos recientes (tabla con tipo, fecha, paginas)
- Quick actions: "Subir documento", "Nueva conversacion"
- Alertas: "Te quedan 2 documentos en plan Free", "Upgrade para OCR"

**Chat (`/chat`):**
- Interfaz tipo ChatGPT/Claude
- Sidebar de conversaciones previas
- Area de mensajes con burbujas (usuario derecha, IA izquierda)
- Citas de fuente clickeables (abren modal con el fragmento del documento)
- Input con boton de envio y atajos de preguntas sugeridas
- Indicador de "pensando..." con animacion
- Soporte para markdown en respuestas (negritas, listas, tablas)

**Documentos (`/documents`):**
- Tabla con: Nombre, Tipo, Paginas, Fecha, Estado (indexado/indexando/error)
- Filtros por tipo (PDF texto, PDF OCR, Imagen)
- Acciones: Ver, Descargar, Eliminar, Reindexar
- Badge de OCR: "OCR" en documentos escaneados
- Barra de busqueda rapida

**Subida (`/upload`):**
- Dropzone grande con icono de nube
- Tipos soportados mostrados: PDF, JPG, PNG
- Preview del archivo antes de subir
- Barra de progreso durante subida
- Procesamiento paso a paso: "Extrayendo texto..." -> "Generando embeddings..." -> "Indexando..."
- Resultado: Resumen de paginas procesadas, chunks generados, confianza OCR
- Alerta si plan Free y ya tiene 3 documentos: "Upgrade a Starter para subir mas"
- Alerta si plan Free intenta subir imagen: "Upgrade a Starter para OCR"

**Busqueda (`/search`):**
- Barra de busqueda semantica (no solo keywords)
- Resultados con highlight de terminos relevantes
- Filtros: por documento, por tipo, por fecha
- Preview del fragmento con contexto
- Score de relevancia (porcentaje)

**Billing (`/billing`):**
- Plan actual con badge destacado
- Usage: documentos usados / limite, storage usado / limite, consultas usadas / limite
- Historial de facturas (mock para demo)
- Boton "Cambiar plan" -> abre modal con los 4 planes
- Metodo de pago (mock con tarjeta de prueba 4242...)
- Cancelar suscripcion (mock)

---

## SECCION I: DOCUMENTOS DEMO (Constructora Nova S.A.)

### I.1 Documentos Precargados (5 archivos PDF texto)

| ID | Nombre | Tipo | Paginas | Contenido Principal |
|----|--------|------|---------|---------------------|
| DOC-001 | Contrato_Laboral_Nova_2026.pdf | PDF texto | 6 | Objeto, jornada, vacaciones, preaviso, beneficios |
| DOC-002 | Manual_RRHH_Nova.pdf | PDF texto | 10 | Horario, vacaciones, permisos, despido |
| DOC-003 | Reglamento_Interno_Nova.pdf | PDF texto | 8 | Conducta, disciplina, sanciones, denuncias |
| DOC-004 | Contrato_Arrendamiento_Oficina.pdf | PDF texto | 5 | Partes, plazo, canon, rescision, mantenimiento |
| DOC-005 | Politica_Compras_Proveedores.pdf | PDF texto | 8 | Adquisicion, cotizaciones, proveedores habilitados |

### I.2 Documentos Demo con OCR (2 archivos adicionales para mostrar capacidad)

| ID | Nombre | Tipo | Paginas | Contenido | Procesamiento |
|----|--------|------|---------|-----------|---------------|
| DOC-006 | Acta_Reunion_Directiva_Nova.jpg | Imagen (foto) | 1 | Acta de reunion de directiva con firmas | OCR directo con pytesseract |
| DOC-007 | Factura_Servicios_Enero_2026.pdf | PDF escaneado | 1 | Factura escaneada de servicios publicos | pdf2image + OCR |

### I.3 Seed Automatico al Iniciar

Al iniciar FastAPI por primera vez, el sistema debe:
1. Verificar si hay documentos en data/demo/
2. Si no hay, copiar los 7 archivos demo
3. Procesar cada uno segun su tipo (texto plano o OCR)
4. Indexar en ChromaDB
5. Guardar metadata en SQLite
6. Log: "7 documentos demo cargados exitosamente"

---

## SECCION J: PIPELINE RAG COMPLETO

### J.1 Diagrama de Flujo Detallado

**Pipeline completo RAG + OCR:**

1. **SUBIDA** - Usuario arrastra archivo a /upload

2. **CLASIFICACION DE TIPO** - Detectar MIME type + extension
   - PDF (.pdf) -> pymupdf intenta extraer texto
     - Si texto > 100 chars -> "PDF texto plano"
     - Si texto < 100 chars -> "PDF escaneado" -> OCR
   - Imagen (.jpg, .png) -> "Imagen" -> OCR directo

3. **EXTRACCION / OCR**
   - PDF texto plano: pymupdf -> texto + numero de pagina
   - PDF escaneado: pdf2image -> lista de imagenes (1 por pagina) -> pytesseract OCR por pagina -> merge de texto
   - Imagen: Pillow carga -> preprocesamiento (grayscale, resize, threshold, denoise) -> pytesseract OCR -> texto + confianza

4. **LIMPIEZA**
   - Eliminar headers/footers repetitivos
   - Normalizar espacios
   - Corregir saltos de linea excesivos
   - Marcar paginas con baja confianza OCR

5. **CHUNKING (LangChain)**
   - RecursiveCharacterTextSplitter
   - chunk_size = 1000 caracteres
   - chunk_overlap = 200 caracteres
   - separadores: [parrafo, linea, oracion, espacio]
   - metadata por chunk: filename, page, chunk_index, total_chunks, source_type

6. **EMBEDDINGS (Local, Offline)**
   - Modelo: sentence-transformers/all-MiniLM-L6-v2
   - 22MB, 384 dimensiones, multilingue (espanol incluido)
   - ~100 chunks/segundo en CPU

7. **INDEXACION (ChromaDB)**
   - Coleccion: "documind_documents"
   - Documento: {id, embedding, metadata, text}
   - Metadata: {filename, page, chunk_index, source_type, ocr_confidence, user_id, uploaded_at}

8. **CONSULTA (RAG Runtime)**
   a. Usuario envia pregunta en /chat
   b. Embedding de la pregunta (mismo modelo)
   c. Busqueda top-k en ChromaDB (k=5 por defecto)
      - Filtro opcional: por documento, por tipo
   d. Recuperar chunks + metadata
   e. Construir prompt con contexto formateado
   f. Enviar a Groq API (Llama 3.1 8B Instant)
   g. Parsear respuesta + extraer citas
   h. Enviar al frontend: {response, sources[], latency_ms}

### J.2 Prompt de Sistema Final

El prompt de sistema para Groq incluye:
- Rol: Asistente experto en documentos empresariales
- Restriccion: Responder UNICAMENTE basado en el contexto proporcionado
- Fallback: "No encontre esa informacion en los documentos cargados."
- Reglas:
  1. Responder en espanol
  2. Ser conciso pero completo (maximo 3 parrafos)
  3. Citar SIEMPRE la fuente: "Fuente: [nombre_archivo], pagina X."
  4. Citar multiples fuentes si aplica
  5. NO inventar informacion
  6. Si texto proviene de OCR con errores, indicarlo: "(Nota: Este documento fue procesado mediante OCR.)"
  7. Si pregunta ambigua, pedir clarificacion
  8. Usar formato markdown

---

## SECCION K: CONFIGURACION DE ENTORNO

### K.1 Archivo `.env.local` (Next.js / Frontend)

Variables de entorno necesarias:

**CLERK (Autenticacion):**
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
- CLERK_SECRET_KEY=sk_test_...
- NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
- NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
- NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
- NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

**STRIPE (Pagos):**
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
- STRIPE_SECRET_KEY=sk_test_...
- STRIPE_WEBHOOK_SECRET=whsec_...
- STRIPE_PRICE_STARTER=price_...
- STRIPE_PRICE_BUSINESS=price_...
- STRIPE_PRICE_ENTERPRISE=price_...

**BACKEND:**
- NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000

### K.2 Archivo `.env` (FastAPI / Backend)

**GROQ (LLM):**
- GROQ_API_KEY=gsk_...
- GROQ_MODEL=llama-3.1-8b-instant

**BASES DE DATOS:**
- CHROMA_PERSIST_DIR=./data/chroma
- SQLITE_DB_PATH=./data/documind.db
- UPLOADS_DIR=./data/uploads

**EMBEDDINGS:**
- EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

**CHUNKING:**
- CHUNK_SIZE=1000
- CHUNK_OVERLAP=200

**RAG:**
- TOP_K_RETRIEVAL=5
- MAX_TOKENS_RESPONSE=1024
- TEMPERATURE=0.1

**OCR:**
- TESSERACT_CMD=/usr/bin/tesseract  (ajustar segun OS)
- OCR_LANG=spa  (Espanol)
- OCR_DPI=300

---

## SECCION L: COMANDOS DE SETUP

### L.1 Setup Inicial (Paso a Paso)

**FASE 0: Estructura del proyecto**

```bash
mkdir documind-ai && cd documind-ai
```

**FRONTEND (Next.js 14):**

```bash
echo "my-app" | npx shadcn@latest init --yes --template next --base-color slate

# Instalar dependencias
pnpm add @clerk/nextjs stripe @stripe/stripe-js framer-motion recharts   react-hook-form zod axios lucide-react

# Instalar componentes shadcn/ui
npx shadcn add button card dialog input tabs table dropdown-menu   sheet toast progress badge avatar skeleton tooltip
```

**BACKEND (FastAPI):**

```bash
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

Crear requirements.txt:
- fastapi==0.110.0
- uvicorn[standard]==0.27.0
- pydantic==2.6.0
- python-dotenv==1.0.0
- python-multipart==0.0.9
- langchain==0.1.0
- chromadb==0.4.0
- sentence-transformers==2.5.0
- groq==0.4.0
- pymupdf==1.23.0
- pdf2image==1.17.0
- pytesseract==0.3.10
- Pillow==10.0.0
- numpy==1.26.0

```bash
pip install -r requirements.txt
```

**Instalar Tesseract OCR (sistema operativo):**

- macOS: `brew install tesseract tesseract-lang`
- Ubuntu/Debian: `sudo apt-get install tesseract-ocr tesseract-ocr-spa poppler-utils`
- Windows: Descargar de https://github.com/UB-Mannheim/tesseract/wiki y agregar al PATH

**Crear estructura de carpetas:**

```bash
mkdir -p api core services models data/uploads data/chroma data/demo
```

### L.2 Comandos de Ejecucion

**Terminal 1: Backend FastAPI**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2: Frontend Next.js**
```bash
cd documind-ai  # raiz del proyecto Next.js
pnpm dev          # Puerto 3000
```

**Terminal 3: Ngrok (para webhooks Stripe en local)**
```bash
ngrok http 3000
# Copiar URL https://xxx.ngrok-free.app
# Configurar en Stripe Dashboard: Webhooks -> endpoint /api/stripe/webhook
```

---

## SECCION M: PLAN DE IMPLEMENTACION (7 Dias)

### Dia 1: Setup y Estructura
- [ ] Inicializar proyecto Next.js con shadcn/ui
- [ ] Configurar Clerk (auth)
- [ ] Configurar Stripe (payments, modo test)
- [ ] Inicializar FastAPI con estructura de carpetas
- [ ] Configurar variables de entorno
- [ ] Crear base de datos SQLite con tablas: users, documents, chats, subscriptions

### Dia 2: Backend Core
- [ ] Implementar extraccion de texto de PDF (pymupdf)
- [ ] Implementar OCR (pdf2image + pytesseract)
- [ ] Implementar OCR para imagenes directas
- [ ] Pipeline de chunking con LangChain
- [ ] Embeddings con sentence-transformers
- [ ] Indexacion en ChromaDB
- [ ] API endpoints: /documents/upload, /documents/list, /documents/delete

### Dia 3: RAG y LLM
- [ ] Integracion con Groq API
- [ ] Endpoint /chat con pipeline RAG completo
- [ ] Endpoint /search semantica
- [ ] Endpoint /metrics
- [ ] Prompt de sistema optimizado
- [ ] Parseo de citas en respuestas

### Dia 4: Frontend — App Autenticada
- [ ] Layout con sidebar y topbar
- [ ] Pagina /dashboard con metricas
- [ ] Pagina /chat con interfaz conversacional
- [ ] Pagina /documents con tabla y filtros
- [ ] Pagina /upload con dropzone y progreso
- [ ] Pagina /search con resultados
- [ ] Pagina /billing con plan actual

### Dia 5: Landing Page
- [ ] Navbar con auth buttons
- [ ] Hero section con animaciones
- [ ] Features section (6 tarjetas)
- [ ] How it works (3 pasos)
- [ ] Pricing section (4 planes)
- [ ] Testimonials section
- [ ] CTA section con formulario waitlist
- [ ] Footer

### Dia 6: Integracion y Polish
- [ ] Conectar frontend con backend (proxy API routes)
- [ ] Webhooks Stripe (checkout + subscription updates)
- [ ] Middleware de autorizacion por plan
- [ ] Manejo de errores y estados de carga
- [ ] Toast notifications
- [ ] Responsive design completo
- [ ] Demo data seed (7 documentos)

### Dia 7: Documentos y Pitch
- [ ] Documento Word de presentacion semestral
- [ ] Pitch deck (12-15 slides)
- [ ] README completo
- [ ] Pruebas de demo (flujo de 3 minutos)
- [ ] Ajustes finales y polish visual

---

## SECCION N: CONTENIDO DE LA PRESENTACION SEMESTRAL

### N.1 Portada
- Universidad Tecnologica de Panama
- Facultad de Ingenieria de Sistemas Computacionales
- Desarrollo y Gestion de Software
- Innovacion y Emprendimiento
- Caso de Innovacion
- Grupo: 1GS241
- Estudiantes: He, Kelvin 8-999-1950; Barrera, Roy 8-1022-2121; Mosquera, Einer 8-924-1880; Athanasidis, Nicolas 8-1001-974
- Profe: Melvin Falcon
- Fecha: 29/5/2026

### N.2 Estructura del Documento Word

Mantener las 15 secciones originales del PRD v3.0 con las siguientes adiciones:

**Nuevas secciones a agregar:**

**Seccion 7.5 — OCR y Procesamiento de Imagenes**
- Descripcion del motor OCR (Tesseract)
- Tipos de archivos soportados (PDF texto, PDF escaneado, imagenes)
- Pipeline de preprocesamiento de imagenes
- Limitaciones y precision del OCR

**Seccion 7.6 — Autenticacion y Pagos**
- Clerk: sistema de autenticacion moderno
- Stripe: pasarela de pagos integrada
- Flujo de suscripcion y upgrade
- Seguridad de datos y cumplimiento

**Seccion 10.4 — Freemium y Plan de Precios**
- Plan Free como gancho de adquisicion
- Limitaciones del plan gratuito (3 documentos, 20 consultas)
- Estrategia de conversion Free -> Starter

### N.3 Pitch Deck (12-15 Slides)

| Slide | Contenido |
|-------|-----------|
| 1 | Portada: Logo, slogan, equipo |
| 2 | El Problema: Caos documental en empresas panamenas |
| 3 | La Solucion: DocuMind AI — cerebro digital |
| 4 | Demo: Screenshot del chat con citas |
| 5 | Tecnologia: Stack (Next.js, FastAPI, RAG, OCR, Groq) |
| 6 | Producto: Features (chat, busqueda, OCR, analytics) |
| 7 | Mercado: TAM/SAM/SOM, segmentacion |
| 8 | Competencia: Matriz comparativa |
| 9 | Modelo de Negocio: Planes de precios + Stripe |
| 10 | Traction: Waitlist, empresas pilotos (ficticio realista) |
| 11 | Finanzas: Proyeccion 3 anos, break-even mes 10 |
| 12 | Equipo: Organigrama con fotos |
| 13 | Roadmap: Corto, mediano, largo plazo |
| 14 | Inversion: $4,100 inicial, LTV/CAC = 28.8 |
| 15 | CTA: QR a demo, contacto, "Transforma tu empresa" |

---

## SECCION O: CONTENIDO DEMO (Constructora Nova S.A.)

### O.1 Flujo de Demo (3 minutos actualizado)

**Paso 1 — Landing Page (15 segundos):**
El presentador abre http://localhost:3000. Se ve la landing futurista.
"Esta es la cara publica de DocuMind AI. Aqui cualquier empresa puede conocernos, ver nuestros planes, y unirse a la lista de espera."

**Paso 2 — Login (10 segundos):**
Hace clic en "Iniciar sesion", ingresa con Google OAuth o email (Clerk).
Se redirige automaticamente al dashboard de Constructora Nova S.A.

**Paso 3 — Dashboard (20 segundos):**
Metricas: 7 documentos indexados (5 texto + 2 OCR), 1,847 chunks, 0 consultas.
Grafica de actividad vacia (primera vez).
Lista de documentos con badges: "PDF" y "OCR".

**Paso 4 — Subida de Documento con OCR (30 segundos):**
"Veamos como funciona el OCR. Voy a subir una imagen de un acta de reunion."
Arrastra DOC-006 (Acta_Reunion_Directiva_Nova.jpg).
Se ve el progreso: "Procesando imagen..." -> "Extrayendo texto con OCR..." -> "Generando embeddings..." -> "Listo".
Resultado: "1 pagina procesada, 12 chunks generados, confianza OCR: 87%"

**Paso 5 — Chatbot (90 segundos):**
- Pregunta 1: "Cuantos dias de vacaciones tiene un empleado con 2 anos?"
  Respuesta con cita exacta.
- Pregunta 2: "Que dice el acta de reunion sobre el presupuesto?"
  Respuesta del documento OCR con nota: "(Nota: Este documento fue procesado mediante OCR.)"
- Pregunta 3: "Cual es el plazo del arrendamiento?"
  Respuesta con cita.

**Paso 6 — Busqueda Semantica (20 segundos):**
Busqueda: "procedimiento disciplinario"
4 resultados con highlight y score de relevancia.

**Paso 7 — Billing (15 segundos):**
"Actualmente estamos en plan Free, que permite 3 documentos. Para subir mas y acceder a OCR avanzado, upgrade a Starter por $49/mes."
Muestra la pagina /pricing con los 4 planes.

**Paso 8 — Cierre (10 segundos):**
"Esto es DocuMind AI. 7 documentos procesados, incluyendo uno por OCR. Imaginen miles de documentos y decenas de empleados consultando simultaneamente."

### O.2 Preguntas y Respuestas Demo (Actualizadas)

| # | Pregunta | Respuesta Esperada | Documento | Pagina | Tipo |
|---|----------|-------------------|-----------|--------|------|
| 1 | Cuantos dias de vacaciones tiene un empleado con 2 anos? | 17 dias habiles | Manual_RRHH_Nova.pdf | 4 | Texto |
| 2 | Que pasa si renuncia sin preaviso? | Perdida de beneficios | Reglamento_Interno_Nova.pdf | 3 | Texto |
| 3 | Plazo del arrendamiento? | 24 meses renovables | Contrato_Arrendamiento_Oficina.pdf | 2 | Texto |
| 4 | Preaviso de renuncia? | 30 dias calendario | Contrato_Laboral_Nova_2026.pdf | 3 | Texto |
| 5 | Quien aprueba compra de $3,000? | Gerente General + Finanzas | Politica_Compras_Proveedores.pdf | 4 | Texto |
| 6 | Horario laboral? | Lunes a viernes 8am-5pm | Manual_RRHH_Nova.pdf | 2 | Texto |
| 7 | Cobertura seguro medico emergencias? | 100% | Contrato_Laboral_Nova_2026.pdf | 4 | Texto |
| 8 | Causales despido inmediato? | Robo, violencia, secretos, ausencia | Manual_RRHH_Nova.pdf | 6 | Texto |
| 9 | Canon mensual de alquiler? | $3,500.00 USD | Contrato_Arrendamiento_Oficina.pdf | 3 | Texto |
| 10 | Cotizaciones para compras >$500? | Al menos 3 cotizaciones | Politica_Compras_Proveedores.pdf | 3 | Texto |
| 11 | Que dice el acta sobre el presupuesto? | [Respuesta del OCR] | Acta_Reunion_Directiva_Nova.jpg | 1 | OCR |
| 12 | Cuanto dice la factura que se debe pagar? | [Respuesta del OCR] | Factura_Servicios_Enero_2026.pdf | 1 | OCR |

---

## SECCION P: REFERENCIAS Y ANEXOS

### P.1 Referencias
1. AMPYME — Autoridad de la Micro, Pequena y Mediana Empresa de Panama. Datos estadisticos de MIPYMES 2026.
2. La Prensa Panama. "MiPymes: motor clave del 70% de la economia panamena." 28 de abril de 2026.
3. Ministerio de Comercio e Industrias de Panama. Ley No. 16 de 2008 (Ley de MIPYMES).
4. Gartner Research. "Enterprise Document Management Market Analysis 2026."
5. LangChain Documentation. "Retrieval-Augmented Generation (RAG) Best Practices." 2026.
6. Groq Cloud. "API Documentation — Llama 3.1 Models." 2026.
7. ChromaDB. "Vector Database for AI Applications." 2026.
8. Clerk Documentation. "Next.js Authentication Guide." 2026.
9. Stripe Documentation. "Subscriptions and Checkout." 2026.
10. Tesseract OCR. "Documentation and Language Models." 2026.
11. Materials de clase: Glosario de Innovacion y Emprendimiento Empresarial, UTP 2026.
12. Materials de clase: Importancia de las MIPYMES en Panama, UTP 2026.
13. Materials de clase: Modulo I — Filosofia del Emprendedor, UTP 2026.

### P.2 Anexos

**Anexo A:** Documentos Demo Completos (7 archivos: 5 PDF texto + 2 OCR)
**Anexo B:** Preguntas de Demo con Respuestas (12 preguntas)
**Anexo C:** Prompt de Sistema del LLM
**Anexo D:** Diagrama de Arquitectura del Sistema
**Anexo E:** Business Model Canvas
**Anexo F:** Glosario de Terminos
**Anexo G:** Configuracion de Clerk + Stripe (paso a paso)
**Anexo H:** Pipeline OCR Detallado
**Anexo I:** Estructura de Carpetas Completa
**Anexo J:** Plan de Implementacion de 7 Dias

---

**Fin del PRD v4.0**

*Documento preparado para implementacion completa con Claude Code.*
*Incluye: Landing + App autenticada + Auth (Clerk) + Pagos (Stripe) + OCR (PDF escaneado + imagenes) + RAG completo.*
*Todo en una sola aplicacion Next.js 14 + FastAPI backend.*
*Prioridad: Ejecucion funcional en 7 dias. Demo impresionante. Pitch que vende la vision.*

