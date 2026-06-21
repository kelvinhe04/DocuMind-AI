# DocuMind AI — PRD v3.0 (Presentacion Semestral Completa)

**Version:** 3.0  
**Fecha:** 20 de junio de 2026  
**Contexto:** Presentacion semestral de Innovacion y Emprendimiento Empresarial — UTP  
**Equipo:** Grupo 1GS241  
**Profesor:** Melvin Falcon  
**Restriccion:** 7 dias para entregar demo funcional + pitch + documento Word + landing  
**Filosofia:** "Demo que vende la vision, no producto terminado."

---

## SECCION A: INSTRUCCIONES PARA CLAUDE (OPUS 4.8)

> **NOTA PARA OPUS 4.8:** Este PRD contiene instrucciones explicitas para que generes los siguientes entregables en iteraciones separadas. Manten este bloque de instrucciones intacto en el plan.md y referencialo en cada iteracion.

### Iteracion 1: plan.md — Plan de Implementacion Tecnico
Generar un plan.md detallado, paso a paso, archivo por archivo, que divida el desarrollo en **fases manejables**. Cada fase debe tener:
- Objetivo claro
- Archivos a crear/modificar
- Codigo funcional (no pseudocodigo)
- Comandos exactos
- Tiempo estimado

**Fases requeridas:**
1. **Fase 0:** Setup inicial (entornos, dependencias, estructura de carpetas)
2. **Fase 1:** Backend core — Pipeline RAG + API endpoints
3. **Fase 2:** Frontend — UI profesional con shadcn/ui
4. **Fase 3:** Integracion — Frontend habla con backend
5. **Fase 4:** Polish — Demo robusta, manejo de errores, estilos
6. **Fase 5:** Documentos demo + seed automatico
7. **Fase 6:** README completo del proyecto

### Iteracion 2: Landing Page Futurista
Generar una landing page moderna, futurista, tipo SaaS (inspirada en Vercel, Linear, Notion) que sirva como:
- Portada publica de DocuMind AI
- Formulario de waitlist
- Showcase del producto
- Precios
- Testimonios (ficticios pero realistas)

**Requisitos de la landing:**
- Next.js 14 (puede ser proyecto separado o pagina adicional)
- Animaciones con Framer Motion
- Gradientes sutiles (slate-900 a slate-800, acentos en violet/emerald)
- Secciones: Hero, Features, Demo Video (placeholder), Pricing, Testimonials, CTA
- Responsive
- SEO basico

### Iteracion 3: Documento Word de la Presentacion Semestral
Generar un documento Word (.docx) completo con la siguiente estructura obligatoria:

**Portada:**
- Universidad Tecnologica de Panama
- Facultad de Ingenieria de Sistemas Computacionales
- Desarrollo y Gestion de Software
- Innovacion y Emprendimiento
- Caso de Innovacion
- Grupo: 1GS241
- Estudiantes: He, Kelvin 8-999-1950; Barrera, Roy 8-1022-2121; Mosquera, Einer 8-924-1880; Athanasidis, Nicolas 8-1001-974
- Profe: Melvin Falcon
- Fecha: 29/5/2026

**Indice automatico**

**1. Introduccion**
- Contexto del proyecto
- Justificacion
- Objetivos

**2. Quienes Somos — La Startup**
- Vision y mision
- Nombre y slogan
- El equipo (organigrama: CEO, Backend, Frontend, QA)

**3. Problema que Resolvemos**
- Descripcion del problema
- Datos de impacto
- Casos reales en Panama

**4. El Software — DocuMind AI**
- Descripcion del producto
- Tecnologias utilizadas (modelos, stack)
- Arquitectura

**5. Landing Page**
- Descripcion de la landing
- Estrategia de adquisicion

**6. Demostracion**
- Escenario de demo
- Flujo paso a paso
- Capturas de pantalla

**7. Como Funciona el Software**
- Modelos de IA utilizados
- Stack tecnico completo
- Pipeline de datos
- Diagrama de arquitectura

**8. Mercado Objetivo**
- TAM / SAM / SOM
- Segmentacion
- Cliente ideal

**9. Competencias**
- Analisis competitivo
- Matriz de comparacion
- Ventaja diferencial

**10. Modelo de Negocio**
- Planes de cobro
- Subscripcion
- Estrategia de precios

**11. Marketing**
- Validacion
- Adquisicion de clientes
- Alianzas estrategicas
- Escalamiento

**12. Objetivos de Crecimiento**
- Corto plazo (0-6 meses)
- Mediano plazo (6-18 meses)
- Largo plazo (18-36 meses)

**13. Finanzas — Proyeccion a 3 Anos**
- Inversion inicial
- Costos operativos
- Proyeccion de ingresos
- Punto de equilibrio

**14. Costos de la Startup — Activos**
- Activos fijos
- Activos intangibles
- Capital de trabajo
- Desglose detallado

**15. Conclusion**
- Resumen del proyecto
- Proximos pasos
- Llamado a la accion

**Referencias**

**Anexos**

### Iteracion 4: Pitch Deck (PPT)
Generar un pitch deck de 12-15 slides en formato PPT o Google Slides con:
- Diseno profesional, moderno, futurista
- Animaciones sutiles
- Graficas y diagramas
- Screenshots del producto
- Datos financieros visualizados
- Organigrama del equipo
- QR a la demo

---

## SECCION B: CONTENIDO COMPLETO DEL PROYECTO

---

## 1. Portada de Presentacion

**UNIVERSIDAD TECNOLOGICA DE PANAMA**
**FACULTAD DE INGENIERIA DE SISTEMAS COMPUTACIONALES**
**DESARROLLO Y GESTION DE SOFTWARE**
**INNOVACION Y EMPRENDIMIENTO**
**CASO DE INNOVACION**

Grupo: 1GS241

Estudiantes:
- He, Kelvin — 8-999-1950
- Barrera, Roy — 8-1022-2121
- Mosquera, Einer — 8-924-1880
- Athanasidis, Nicolas — 8-1001-974

Profe: Melvin Falcon

Fecha: 29/5/2026

---

## 2. Quienes Somos — La Startup

### 2.1 Nombre
**DocuMind AI**

### 2.2 Slogan
> "El cerebro digital de tu empresa."

### 2.3 Vision
Convertirnos en la infraestructura de conocimiento estandar para empresas latinoamericanas, comenzando por Panama y expandiendonos por Centroamerica y el Caribe.

### 2.4 Mision
Democratizar el acceso a la inteligencia documental para empresas de todos los tamanos, eliminando la perdida de tiempo en la busqueda de informacion y reduciendo errores por uso de documentos obsoletos.

### 2.5 El Equipo — Organigrama

```
                    +------------------+
                    |      CEO         |
                    |   Kelvin He      |
                    |  (Vision, Estra- |
                    |   tegia, Pitch,  |
                    |   Relaciones)    |
                    +--------+---------+
                             |
        +--------------------+--------------------+
        |                    |                    |
+-------+--------+  +--------+--------+  +--------+--------+
|    Backend     |  |   Frontend      |  |      QA         |
|  Roy Barrera   |  |  Einer Mosquera  |  | Nicolas Athana- |
| (FastAPI, RAG, |  | (Next.js, React, |  | sidis           |
|  ChromaDB,     |  |  shadcn/ui,      |  | (Testing, Docu- |
|  Embeddings)   |  |  Tailwind, Demo) |  |  mentacion,     |
|                |  |                  |  |  Pitch Support) |
+----------------+  +-----------------+  +-----------------+
```

**Roles detallados:**

| Rol | Integrante | Responsabilidades |
|-----|-----------|-------------------|
| **CEO** | Kelvin He | Vision del producto, pitch a inversionistas, estrategia de negocio, relaciones con aliados (AMPYME, Camara de Comercio), toma de decisiones ejecutivas. |
| **Backend Lead** | Roy Barrera | Arquitectura del pipeline RAG, API REST con FastAPI, base de datos vectorial (ChromaDB), embeddings, integracion con LLMs (Groq), seguridad de datos. |
| **Frontend Lead** | Einer Mosquera | Interfaz de usuario con Next.js y shadcn/ui, experiencia de chat, dashboard de metricas, responsive design, animaciones y polish visual. |
| **QA / Documentacion** | Nicolas Athanasidis | Pruebas funcionales de la demo, documentacion tecnica, soporte en el pitch, control de calidad del producto, manuales de usuario. |

---

## 3. Problema que Resolvemos

### 3.1 Descripcion del Problema
Las empresas en Panama y Latinoamerica almacenan miles de documentos digitales sin una forma inteligente de consultarlos:

- Contratos laborales, comerciales y de servicios
- Manuales de procedimientos y politicas internas
- Normativas legales y reglamentos
- Facturas y documentacion contable
- Correspondencia institucional

Cuando un empleado necesita informacion:
- Pierde tiempo buscando en carpetas compartidas
- Pregunta a otros companeros (interrumpe su trabajo)
- Puede utilizar una version incorrecta u obsoleta del documento
- No hay forma de saber si la informacion encontrada es la mas reciente

### 3.2 Datos de Impacto

**Empresa de 50 colaboradores:**
- 2.5 horas perdidas por empleado cada semana buscando documentos
- 125 horas semanales desperdiciadas en total
- Mas de 6,000 horas al ano de productividad perdida
- Costo estimado: $45,000 - $75,000 USD anuales en tiempo no productivo

**Contexto panameno (datos de los materiales de clase):**
- El 95% de las empresas mueren en sus primeros tres anos por falta de preparacion y procesos, no por falta de capital. (La Prensa Panama, 2026)
- El verdadero reto no es el financiamiento ni el acceso al mercado, sino la falta de preparacion para hacer negocios. (AMPYME)
- Las MIPYMES representan mas del 90% de las empresas en Panama y son el motor del 70% de la economia.
- El 95% de las empresas en Panama son MIPYMES sin herramientas tecnologicas para gestionar su conocimiento documental.

### 3.3 Casos Reales en Panama
- Un bufete de abogados en Panama City tiene 15,000 resoluciones de la CSJ en PDFs sin indice.
- Una constructora local pierde 3 horas semanales por empleado buscando clausulas de contratos.
- Una universidad privada no puede responder rapidamente preguntas de estudiantes sobre reglamentos porque estan dispersos en cientos de PDFs.

---

## 4. El Software — DocuMind AI

### 4.1 Descripcion del Producto
DocuMind AI es un Sistema Operativo del Conocimiento Empresarial que convierte documentos estaticos en conocimiento accionable mediante inteligencia artificial.

**Funcionalidades principales:**
1. **DocuMind Search:** Busqueda semantica inteligente que entiende el significado, no solo las palabras clave.
2. **DocuMind Chat:** Chatbot conversacional que responde preguntas en lenguaje natural citando la fuente exacta.
3. **DocuMind Insights:** (Roadmap) Analisis automatico de documentos para detectar riesgos, vencimientos y cambios importantes.
4. **DocuMind Compliance:** (Roadmap) Monitoreo de normativas con alertas automaticas ante cambios regulatorios.
5. **DocuMind Analytics:** Dashboard empresarial con metricas de uso, productividad y tendencias.

### 4.2 Diferenciacion Clave
> ChatGPT responde con conocimiento general de internet. DocuMind responde con los documentos internos de tu empresa, citando archivo, pagina y parrafo exactos.

### 4.3 Tecnologias Utilizadas

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- shadcn/ui (componentes accesibles y modernos)
- pnpm (gestor de paquetes)
- Lucide React (iconos)
- Recharts (graficas)

**Backend:**
- Python 3.11
- FastAPI (framework async moderno)
- Uvicorn (servidor ASGI con hot reload)
- Pydantic (validacion de datos)
- LangChain (orquestacion RAG)

**Inteligencia Artificial:**
- Embeddings: sentence-transformers/all-MiniLM-L6-v2 (local, 22MB, offline)
- LLM Primario: Groq API — Llama 3.1 8B Instant (gratis, 30 req/min, ~1s respuesta)
- LLM Fallback: Modo extractivo (sin LLM, muestra chunks relevantes)
- Vector DB: ChromaDB persistente (local, gratis)
- Chunking: LangChain RecursiveCharacterTextSplitter

**Almacenamiento:**
- Archivos: Sistema de archivos local (./data/uploads/)
- Metadata: SQLite (./data/documind.db)
- Vectores: ChromaDB (./data/chroma/)

**Infraestructura:**
- Sin Docker (todo nativo)
- Hot reload: pnpm dev (frontend) + uvicorn --reload (backend)
- Demo local en laptop del presentador

### 4.4 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│  USUARIO (Navegador)                                        │
│  http://localhost:3000                                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  FRONTEND (Next.js 14 + React + Tailwind + shadcn/ui)       │
│  - Login / Landing                                            │
│  - Chat con citas de fuente                                   │
│  - Upload de PDFs (drag & drop)                              │
│  - Dashboard de metricas                                     │
│  - Busqueda semantica                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST JSON
┌──────────────────────────▼──────────────────────────────────┐
│  BACKEND (FastAPI + Python 3.11)                            │
│  POST /api/documents/upload  →  Guarda + indexa PDF         │
│  GET  /api/documents         →  Lista documentos            │
│  POST /api/chat              →  RAG + respuesta con citas  │
│  GET  /api/dashboard/metrics →  Metricas del sistema        │
└──────────────────────────┬──────────────────────────────────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  PIPELINE  │  │  CHROMADB  │  │  SQLITE    │
    │    RAG     │  │ (Vectores) │  │ (Metadata) │
    │            │  │            │  │            │
    │ 1. Carga   │  │ - Embed.   │  │ - Docs     │
    │ 2. Chunk   │──▶│ - Busqueda │  │ - Chats    │
    │ 3. Embed   │  │ - Metadata │  │ - Metrics  │
    │ 4. Index   │  │            │  │            │
    └─────┬──────┘  └────────────┘  └────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  LLM (Groq API / Modo Extractivo)                           │
│  - Genera respuesta con contexto de chunks recuperados      │
│  - Cita fuentes: archivo, pagina, parrafo                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Landing Page

### 5.1 Descripcion
Landing page moderna, futurista, tipo SaaS (inspirada en Vercel, Linear, Notion) que sirve como portada publica de DocuMind AI.

### 5.2 Secciones
1. **Hero:** Titulo grande animado, slogan, CTA "Unete a la lista de espera", screenshot del producto flotante.
2. **Features:** 6 tarjetas con iconos animados mostrando funcionalidades (Busqueda semantica, Chat con citas, Insights, Compliance, Analytics, On-premise).
3. **Demo Video:** Placeholder de video con play button (en produccion seria un video real).
4. **Pricing:** Tabla comparativa de los 3 planes (Starter, Business, Enterprise).
5. **Testimonials:** 3 testimonios ficticios pero realistas de empresas panamenas.
6. **CTA Final:** "Transforma tu empresa hoy" + formulario de email.

### 5.3 Diseno Visual
- Fondo: gradiente slate-900 a slate-800
- Acentos: violet-500 y emerald-500
- Tipografia: Inter (sans-serif moderna)
- Animaciones: Framer Motion (fade-in, slide-up, hover effects)
- Efectos: Grid sutil de fondo, glow en elementos destacados, glassmorphism en cards

### 5.4 Estrategia de Adquisicion via Landing
- Formulario de waitlist captura emails
- Oferta: "Acceso anticipado gratis para las primeras 50 empresas"
- Compartir en redes sociales desbloquea contenido exclusivo
- Tracking con Google Analytics (gratis)

---

## 6. Demostracion

### 6.1 Escenario: Constructora Nova S.A.
Empresa ficticia de construccion en Panama con 50 empleados. Maneja contratos, manuales y reglamentos.

### 6.2 Documentos Precargados

**DOC-001: Contrato_Laboral_Nova_2026.pdf**
- Contrato tipo para empleados de Constructora Nova S.A.
- 6 paginas
- Contenido: objeto, jornada laboral, vacaciones, preaviso, beneficios de salud

**DOC-002: Manual_RRHH_Nova.pdf**
- Manual de recursos humanos
- 10 paginas
- Contenido: horario laboral, vacaciones y permisos, procedimiento de despido

**DOC-003: Reglamento_Interno_Nova.pdf**
- Reglamento interno de la empresa
- 8 paginas
- Contenido: conducta y disciplina, sanciones, canal de denuncias

**DOC-004: Contrato_Arrendamiento_Oficina.pdf**
- Contrato de arrendamiento de oficina principal
- 5 paginas
- Contenido: partes, plazo, canon de alquiler, rescision, mantenimiento

**DOC-005: Politica_Compras_Proveedores.pdf**
- Politica de compras y proveedores
- 8 paginas
- Contenido: generalidades, procedimiento de adquisicion, proveedores habilitados

### 6.3 Flujo de Demo (3 minutos)

**Paso 1 — Login (10 segundos):**
El presentador accede a http://localhost:3000, ingresa credenciales de demo (admin@novasa.com / demo2026) y se carga el workspace de Constructora Nova S.A.

**Paso 2 — Dashboard (20 segundos):**
Se muestran metricas: 5 documentos indexados, 1,247 chunks generados, 0 preguntas realizadas. Grafica de actividad y lista de documentos recientes.

**Paso 3 — Chatbot (90 segundos):**
- Pregunta 1: "Cuantos dias de vacaciones tiene un empleado con 2 anos de servicio?"
  Respuesta: "Segun el Manual de RRHH, pagina 4, un empleado con 2 anos tiene derecho a 17 dias habiles de vacaciones anuales (15 base + 2 por antiguedad). Fuente: Manual_RRHH_Nova.pdf, pagina 4."

- Pregunta 2: "Que pasa si un empleado renuncia sin dar preaviso?"
  Respuesta: "Segun el Reglamento Interno, pagina 3, Articulo 4.2, la renuncia sin preaviso de 30 dias calendario puede resultar en la perdida de beneficios pendientes y una carta de recomendacion condicionada. Fuente: Reglamento_Interno_Nova.pdf, pagina 3."

- Pregunta 3: "Cual es el plazo del arrendamiento de la oficina?"
  Respuesta: "Segun el Contrato de Arrendamiento, pagina 2, Clausula 3, el plazo es de 24 meses renovables, iniciando el 1 de enero de 2026. Fuente: Contrato_Arrendamiento_Oficina.pdf, pagina 2."

**Paso 4 — Busqueda Semantica (30 segundos):**
Busqueda: "procedimiento disciplinario"
Resultados: 4 fragmentos de diferentes documentos, ordenados por relevancia, con highlight de terminos.

**Paso 5 — Cierre (10 segundos):**
"Esto es Constructora Nova S.A. con 5 documentos. Imaginen 5,000 documentos y 50 empleados consultando simultaneamente. Eso es DocuMind AI."

### 6.4 Preguntas y Respuestas Esperadas

| # | Pregunta | Respuesta Esperada | Documento | Pagina |
|---|----------|-------------------|-----------|--------|
| 1 | Cuantos dias de vacaciones tiene un empleado con 2 anos de servicio? | 17 dias habiles (15 base + 2 por antiguedad) | Manual_RRHH_Nova.pdf | 4 |
| 2 | Que pasa si un empleado renuncia sin dar preaviso? | Perdida de beneficios pendientes y carta de recomendacion condicionada | Reglamento_Interno_Nova.pdf | 3 |
| 3 | Cual es el plazo del arrendamiento de la oficina? | 24 meses renovables | Contrato_Arrendamiento_Oficina.pdf | 2 |
| 4 | Cuantos dias de preaviso debe dar el empleado para renunciar? | 30 dias calendario | Contrato_Laboral_Nova_2026.pdf | 3 |
| 5 | Quien aprueba una compra de $3,000? | Gerente General con visto bueno de Finanzas | Politica_Compras_Proveedores.pdf | 4 |
| 6 | Cual es el horario laboral? | Lunes a viernes, 8:00 AM a 5:00 PM | Manual_RRHH_Nova.pdf | 2 |
| 7 | Que cobertura tiene el seguro medico para emergencias? | 100% | Contrato_Laboral_Nova_2026.pdf | 4 |
| 8 | Cuales son las causales de despido inmediato? | Robo, violencia, revelacion de secretos comerciales, ausencia injustificada por mas de 3 dias consecutivos | Manual_RRHH_Nova.pdf | 6 |
| 9 | Cuanto es el canon mensual de alquiler? | $3,500.00 USD | Contrato_Arrendamiento_Oficina.pdf | 3 |
| 10 | Cuantas cotizaciones se requieren para compras mayores a $500? | Al menos 3 cotizaciones de proveedores diferentes | Politica_Compras_Proveedores.pdf | 3 |

---

## 7. Como Funciona el Software

### 7.1 Modelos de IA Utilizados

**Embeddings (Local, Offline):**
- Modelo: sentence-transformers/all-MiniLM-L6-v2
- Tamano: 22MB
- Funcion: Convierte texto en vectores numericos de 384 dimensiones
- Ventaja: No requiere internet, rapido, multilingue (incluye espanol)

**LLM Generativo (Cloud, Gratis):**
- Proveedor: Groq
- Modelo: Llama 3.1 8B Instant
- Costo: $0 (tier gratuito, 30 requests/minuto)
- Latencia: ~1 segundo por respuesta
- Ventaja: Ultrarrapido, modelo open source, no requiere GPU propia

**LLM Fallback (Offline):**
- Modo: Extractivo (sin LLM)
- Funcion: Muestra los 5 chunks de texto mas relevantes sin generar respuesta
- Ventaja: Siempre funciona, incluso sin internet ni API keys

### 7.2 Stack Tecnico Completo

| Capa | Tecnologia | Proposito |
|------|-----------|-----------|
| Frontend Framework | Next.js 14 App Router | SSR, routing, API routes opcionales |
| UI Library | React 18 + TypeScript | Componentes interactivos |
| Styling | Tailwind CSS 3.4 | Estilos utilitarios, desarrollo rapido |
| Components | shadcn/ui | Componentes accesibles y modernos |
| Package Manager | pnpm 8 | Mas rapido que npm, menos espacio |
| Icons | Lucide React | Iconos limpios y modernos |
| Charts | Recharts | Graficas de dashboard |
| Animations | Framer Motion | Animaciones de landing page |
| Backend Framework | FastAPI 0.110 | API REST async, auto-documentacion |
| Server | Uvicorn 0.27 | Servidor ASGI con hot reload |
| Validation | Pydantic 2.6 | Validacion de request/response |
| RAG Orchestration | LangChain 0.1 | Pipeline de ingestion, chunking, retrieval |
| Embeddings | sentence-transformers 2.5 | Modelo local all-MiniLM-L6-v2 |
| Vector Database | ChromaDB 0.4 | Almacenamiento y busqueda de vectores |
| LLM Client | Groq Python SDK | API de inferencia rapida |
| PDF Extraction | pymupdf | Extraccion de texto con metadata de paginas |
| Relational DB | SQLite | Metadata de documentos y conversaciones |
| Environment | python-dotenv | Variables de entorno |

### 7.3 Pipeline de Datos (RAG)

```
1. SUBIDA DE PDF
   Usuario sube archivo PDF via drag & drop
   ↓
2. EXTRACCION DE TEXTO
   pymupdf extrae texto plano + numero de pagina
   ↓
3. LIMPIEZA
   Elimina headers/footers repetitivos, espacios extra
   ↓
4. CHUNKING
   RecursiveCharacterTextSplitter:
   - chunk_size = 1000 caracteres
   - chunk_overlap = 200 caracteres
   ↓
5. EMBEDDINGS
   all-MiniLM-L6-v2 convierte cada chunk en vector de 384 dimensiones
   ↓
6. INDEXACION
   ChromaDB almacena: {id, embedding, metadata: {filename, page, text}}
   ↓
7. CONSULTA (RAG)
   a. Embedding de la pregunta del usuario
   b. Busqueda de top-5 chunks por similitud coseno
   c. Construccion de prompt con contexto + pregunta
   d. Envio a Groq API (Llama 3.1 8B)
   e. Generacion de respuesta con citas de fuente
   f. Parseo de respuesta para extraer fuentes
   g. Envio al frontend: {response, sources[]}
```

### 7.4 Prompt de Sistema (Groq)

```
Eres DocuMind AI, un asistente experto en documentos empresariales.
Responde UNICAMENTE basandote en el contexto proporcionado debajo.
Si la respuesta no esta en el contexto, di exactamente:
"No encontre esa informacion en los documentos cargados."

REGLAS:
1. Responde en espanol.
2. Se conciso pero completo.
3. Cita SIEMPRE la fuente al final:
   "Fuente: [nombre_archivo.pdf], pagina X."
4. Si hay multiples fuentes, cita la mas relevante.
5. No inventes informacion que no este en el contexto.

Contexto:
{context}

Pregunta del usuario: {question}

Respuesta:
```

---

## 8. Mercado Objetivo

### 8.1 TAM / SAM / SOM

| Metrica | Valor | Descripcion |
|---------|-------|-------------|
| **TAM** | $6.78B USD | Mercado global de gestion documental e inteligencia empresarial (2026) |
| **SAM** | $800M USD | Mercado de Latinoamerica (Mexico, Centroamerica, Colombia, Peru, Chile) |
| **SOM** | $45M USD | Mercado alcanzable inicial: Panama + Costa Rica + Colombia en 3 anos |

### 8.2 Segmentacion de Clientes

**Fase 1 — Panama (Meses 1-12):**
- Despachos legales (bufetes de abogados, notarias)
- Consultoras (auditoria, recursos humanos, finanzas)
- Universidades (UTP, UP, USMA — area administrativa)
- Bancos (area de compliance y riesgos)
- Constructoras (gestion de contratos y proveedores)

**Fase 2 — Centroamerica (Ano 2):**
- Costa Rica (sector tecnologico y servicios)
- Colombia (mercado grande, espanol similar)

**Fase 3 — Latinoamerica (Ano 3+):**
- Mexico (mercado mas grande de LA)
- Peru, Chile, Ecuador

### 8.3 Cliente Ideal (Buyer Persona)

**Nombre:** Carlos Mendez
**Edad:** 42 anos
**Rol:** Gerente General de constructora mediana (50 empleados)
**Ubicacion:** Panama City, Panama
**Dolor principal:** Pierde 5 horas semanales buscando clausulas de contratos y respondiendo preguntas de empleados sobre politicas internas.
**Presupuesto mensual para software:** $200-$500 USD
**Decision de compra:** Recomendacion de colega + demo gratuita de 14 dias

---

## 9. Competencias

### 9.1 Analisis Competitivo

| Competidor | Tipo | Precio | Fortaleza | Debilidad vs. DocuMind |
|------------|------|--------|-----------|----------------------|
| **ChatGPT Enterprise** | LLM generico | $30/usuario/mes | Conocimiento general potente | No conoce documentos internos. Alucinaciones. Costoso por usuario. |
| **Microsoft Copilot** | Integracion Office | $30/usuario/mes | Integrado con Word/Excel/Teams | Requiere ecosistema Microsoft completo. Precio alto. |
| **Glean** | Enterprise search | $$$ (enterprise only) | Busqueda potente en empresas grandes | Solo para empresas grandes (500+ empleados). Precio prohibitivo. |
| **Notion AI** | Workspace + IA | $10/usuario/mes | Buena para notas y wikis | No disenado para PDFs legales/complejos. No cita fuentes exactas. |
| **AskYourPDF** | Chat de PDFs | $15/mes | Simple, facil de usar | Solo 1 PDF a la vez. No es multi-documento. No es enterprise. |
| **DocuMind AI** | RAG Enterprise | $49-$999/mes | Espanol nativo, citas exactas, on-premise opcional, precio latinoamericano | Startup nueva, falta de marca reconocida. |

### 9.2 Matriz de Comparacion

| Caracteristica | DocuMind | ChatGPT | Copilot | Glean | Notion AI |
|----------------|----------|---------|---------|-------|-----------|
| Citas exactas (archivo, pagina) | SI | NO | PARCIAL | NO | NO |
| Multi-documento | SI | NO | SI | SI | NO |
| Espanol panameno/latinoamericano | SI | GENERICO | GENERICO | GENERICO | GENERICO |
| On-premise opcional | SI | NO | NO | NO | NO |
| Precio para MIPYMES | $49-$199 | $30/user | $30/user | $$$$ | $10/user |
| Open source stack | SI | NO | NO | NO | NO |
| Sin dependencia de Big Tech | SI | NO | NO | NO | NO |

### 9.3 Ventaja Diferencial

**La trazabilidad exacta:** Ningun competidor muestra "pagina 7, parrafo 3" con tanta precision. Esto es oro para:
- Abogados que necesitan citar contratos en tribunales
- Auditores que deben rastrear politicas internas
- Compliance officers que necesitan demostrar que siguieron procedimientos

---

## 10. Modelo de Negocio

### 10.1 Estructura de Precios

| Plan | Precio Mensual | Usuarios | Almacenamiento | Caracteristicas |
|------|---------------|----------|----------------|-----------------|
| **Starter** | $49 USD | 5 | 5 GB | Chat RAG, busqueda semantica, dashboard basico, soporte por email, 1 workspace |
| **Business** | $199 USD | 50 | 100 GB | Todo Starter + multi-workspace, analytics avanzados, API access, soporte prioritario, integraciones basicas |
| **Enterprise** | $999 USD | Ilimitados | Ilimitado | Todo Business + on-premise, integracion SAP/SharePoint, SSO/SAML, auditoria completa, CSM dedicado, SLA 99.9% |

### 10.2 Estrategia de Precios

**Freemium educativo:**
- Universidades: 1 workspace gratis para uso academico
- Estudiantes: Acceso gratuito con limitaciones (3 documentos, 20 consultas/mes)

**Descuentos:**
- Pago anual: 2 meses gratis (17% de descuento)
- Early adopters: 50% descuento primer ano a cambio de testimonio publico
- Organizaciones sin fines de lucro: 30% descuento permanente

**Precio adaptado a Panama:**
- Los precios estan en USD pero son competitivos vs. alternativas de Silicon Valley
- Starter ($49) es accesible para microempresas panamenas
- Business ($199) es atractivo para pequenas empresas de 20-50 empleados
- Enterprise ($999) compite con soluciones que cuestan $5,000+/mes

### 10.3 Ingresos Esperados por Cliente

| Plan | ARPU Mensual | ARPU Anual | Margen Bruto |
|------|-------------|-----------|-------------|
| Starter | $49 | $588 | 75% |
| Business | $199 | $2,388 | 70% |
| Enterprise | $999 | $11,988 | 65% |

---

## 11. Marketing

### 11.1 Validacion (Fase 0 — Mes 0-1)

**Objetivo:** Confirmar que empresas reales pagarian por DocuMind antes de invertir en desarrollo completo.

**Tacticas:**
- Landing page con formulario de waitlist
- Meta: 100 correos de interesados en 30 dias
- Oferta: "Acceso anticipado gratuito para las primeras 50 empresas"
- Metrica de exito: Si 20+ correos son de empresas reales (no amigos/familia), el problema esta validado

**Canales de validacion:**
- LinkedIn: Posts sobre productividad documental en Panama
- Grupos de Facebook: Emprendedores Panama, Negocios Panama
- WhatsApp Business: Contacto directo con 20 empresas potenciales

### 11.2 Adquisicion de Clientes (Fase 1 — Meses 1-6)

**Canales pagados (bajo presupuesto):**
- Google Ads: $200/mes en keywords "software gestion documental Panama", "organizar contratos empresa"
- LinkedIn Ads: $100/mes targeting gerentes de RRHH y legales en Panama

**Canales organicos (gratis):**
- Blog SEO: "Como reducir 50% el tiempo de busqueda de documentos en tu empresa"
- YouTube: Demos de 2 minutos mostrando el producto
- LinkedIn personal: 3 posts semanales sobre productividad y tecnologia

**Conversion:**
- Landing page → Waitlist → Demo gratuita de 14 dias → Onboarding → Pago

### 11.3 Alianzas Estrategicas (Fase 2 — Meses 6-12)

**AMPYME (Autoridad de la Micro, Pequena y Mediana Empresa):**
- Alianza para ofrecer DocuMind a emprendedores formalizados
- Acceso a la red de MiPymes de Panama
- Posible co-marketing en eventos

**Camara de Comercio de Panama:**
- Demo en eventos de networking empresarial
- Descuento especial para socios de la Camara
- Testimonio institucional

**Universidades (UTP, UP, USMA):**
- Licencias gratuitas para uso academico
- Programas de pasantia con estudiantes de sistemas
- Casos de estudio en clases de emprendimiento

**Despachos de abogados:**
- Programa de early adopters con 50% descuento
- Casos de exito publicados en redes sociales
- Referrals entre bufetes

### 11.4 Escalamiento (Fase 3 — Ano 2+)

**Expansion geografica:**
- Costa Rica: Mercado similar, espanol, sector servicios fuerte
- Colombia: Mercado grande, ecosistema de startups activo
- Mexico: Mercado mas grande de Latinoamerica

**Expansion de producto:**
- API publica para desarrolladores
- Marketplace de integraciones (Google Drive, Dropbox, OneDrive, SAP)
- White-label para consultoras que quieran ofrecer DocuMind bajo su marca

**Canales de venta:**
- Resellers locales en cada pais
- Partnerships con consultoras de tecnologia
- Venta directa via inside sales

---

## 12. Objetivos de Crecimiento

### 12.1 Corto Plazo (0-6 meses)

| Objetivo | Meta | KPI |
|----------|------|-----|
| Lanzar MVP funcional | 100% completo | Demo funcional sin errores |
| Conseguir empresas pilotos | 10 empresas | Feedback cualitativo recopilado |
| Validar modelo de precios | 5 pagos reales | Revenue > $0 confirmado |
| Registrar marca DocuMind | 100% completo | Registro en DPI Panama |
| Constituir empresa | 100% completo | SA de Panama activa |
| Conseguir waitlist | 500 suscriptores | 50% de empresas reales |

### 12.2 Mediano Plazo (6-18 meses)

| Objetivo | Meta | KPI |
|----------|------|-----|
| Alcanzar clientes pagos | 100 clientes | MRR > $10,000 |
| Lanzar version 2.0 | 100% completo | Multi-tenancy real + API publica |
| Expandir geograficamente | 2 paises nuevos | Costa Rica y Colombia operativos |
| Equipo completo | 5 personas | 2 devs, 1 ventas, 1 soporte, 1 CEO |
| Levantar ronda semilla | $50,000-$100,000 | Term sheet firmado |
| Alianzas estrategicas | 3 activas | AMPYME, Camara de Comercio, 1 universidad |

### 12.3 Largo Plazo (18-36 meses)

| Objetivo | Meta | KPI |
|----------|------|-----|
| Clientes activos | 1,000+ | ARR > $1M |
| Cobertura geografica | 5 paises | Panama, CR, Colombia, Mexico, Peru |
| Lanzar modulos avanzados | 100% completo | Compliance + Insights activos |
| Integraciones gubernamentales | 3 activas | DGI, CSS, Municipio de Panama |
| Expansion a hispanos en USA | 1 mercado | Miami/Texas operativo |
| Opciones de salida | 2 opciones | Adquisicion por Box/Dropbox o IPO local |

---

## 13. Finanzas — Proyeccion a 3 Anos

### 13.1 Supuestos Clave

- Precio promedio ponderado por cliente: $120/mes
- Churn anual: 15%
- Crecimiento mensual de clientes nuevos:
  - Meses 1-6: 2-3 clientes/mes
  - Meses 7-12: 5 clientes/mes
  - Ano 2: 8-10 clientes/mes
  - Ano 3: 15-20 clientes/mes
- CAC (Customer Acquisition Cost): $50/cliente (marketing digital organico + alianzas)
- LTV (Lifetime Value): $1,440 (precio promedio $120 x 12 meses x 85% retencion / 15% churn)
- Ratio LTV/CAC: 28.8 (excelente, >3 es saludable)

### 13.2 Proyeccion Financiera

| Metrica | Ano 1 | Ano 2 | Ano 3 |
|---------|-------|-------|-------|
| Clientes nuevos | 20 | 80 | 300 |
| Clientes acumulados (fin ano) | 20 | 85 | 340 |
| Clientes recurrentes (fin ano) | 17 | 72 | 289 |
| Churn (clientes perdidos) | 3 | 13 | 51 |
| MRR (Monthly Recurring Revenue) | $2,040 | $8,640 | $34,680 |
| ARR (Annual Recurring Revenue) | $12,000 | $60,000 | $300,000 |
| Costos operativos anuales | $8,000 | $35,000 | $120,000 |
| Utilidad neta anual | $4,000 | $25,000 | $180,000 |
| Margen neto | 33% | 42% | 60% |
| Break-even | Mes 10 | — | — |

### 13.3 Desglose de Costos Operativos por Ano

**Ano 1 ($8,000 total):**
| Concepto | Mensual | Anual |
|----------|---------|-------|
| Servidor cloud (1x GPU A4000, vLLM) | $209 | $2,508 |
| Marketing digital (LinkedIn, Google Ads) | $200 | $2,400 |
| Herramientas (GitHub, Figma, Notion) | $50 | $600 |
| Legal y contable (registro, impuestos) | $200 | $2,400 |
| Internet y servicios basicos | $8 | $92 |
| **Total** | **$667** | **$8,000** |

**Ano 2 ($35,000 total):**
| Concepto | Mensual | Anual |
|----------|---------|-------|
| Servidores cloud (escalado) | $800 | $9,600 |
| Marketing (aumentado) | $500 | $6,000 |
| Salarios (2 devs part-time) | $1,000 | $12,000 |
| Herramientas y software | $100 | $1,200 |
| Legal, contable, impuestos | $300 | $3,600 |
| Viajes y eventos | $200 | $2,400 |
| **Total** | **$2,900** | **$35,000** |

**Ano 3 ($120,000 total):**
| Concepto | Mensual | Anual |
|----------|---------|-------|
| Infraestructura cloud (escalado) | $3,000 | $36,000 |
| Marketing y ventas | $2,000 | $24,000 |
| Salarios (5 personas full-time) | $4,000 | $48,000 |
| Herramientas y software | $300 | $3,600 |
| Legal, contable, impuestos | $500 | $6,000 |
| Oficina y operaciones | $200 | $2,400 |
| **Total** | **$10,000** | **$120,000** |

### 13.4 Punto de Equilibrio

- **Inversion inicial:** $4,100
- **Costos fijos mensuales (Ano 1):** $667
- **Ingreso promedio por cliente:** $120/mes
- **Clientes necesarios para break-even:** 6 clientes
- **Mes de break-even:** Mes 10 (con crecimiento de 2-3 clientes/mes)

### 13.5 Grafica de Proyeccion (descripcion para Excel)

Grafica de barras agrupadas:
- Eje X: Ano 1, Ano 2, Ano 3
- Eje Y: Miles de USD
- Series: Ingresos (verde), Costos (rojo), Utilidad (azul)
- Ano 1: Ingresos $12K, Costos $8K, Utilidad $4K
- Ano 2: Ingresos $60K, Costos $35K, Utilidad $25K
- Ano 3: Ingresos $300K, Costos $120K, Utilidad $180K

Linea de tendencia superpuesta mostrando crecimiento exponencial (hockey stick).

---

## 14. Costos de la Startup — Activos

### 14.1 Inversion Inicial Requerida

| Concepto | Monto (USD) | Descripcion |
|----------|-------------|-------------|
| Laptop de desarrollo (GPU dedicada) | $1,200 | Laptop con 16GB RAM minimo para correr Ollama local si es necesario |
| Dominio + hosting (1 ano) | $100 | documind.ai o documind-pa.com + hosting basico |
| Branding y diseno | $300 | Logo profesional, mockups, paleta de colores, iconografia |
| Registro de empresa (SA Panama) | $500 | Constitucion en Registro Publico, patente comercial |
| Capital de trabajo (3 meses) | $2,000 | Cubre costos operativos mientras se consiguen primeros clientes |
| **Total inversion inicial** | **$4,100** | |

### 14.2 Activos Fijos

| Activo | Valor Inicial | Vida Util | Depreciacion Anual |
|--------|--------------|-----------|-------------------|
| Equipos informaticos (laptops x4) | $4,800 | 3 anos | $1,600 |
| Mobiliario de oficina (escritorios, sillas) | $600 | 5 anos | $120 |
| Servidor dedicado (Ano 2) | $2,500 | 3 anos | $833 |
| **Total activos fijos** | **$7,900** | | **$2,553** |

### 14.3 Activos Intangibles

| Activo | Valor | Descripcion |
|--------|-------|-------------|
| Software propietario (DocuMind AI) | $15,000 | Valor estimado del codigo fuente y algoritmos |
| Marca registrada | $500 | Registro de marca en DPI Panama |
| Base de conocimiento (documentos indexados) | $2,000 | Valor de los datos y embeddings acumulados |
| Relaciones comerciales | $1,000 | Red de contactos, aliados, clientes potenciales |
| **Total activos intangibles** | **$18,500** | |

### 14.4 Capital de Trabajo

| Concepto | Mes 1-3 | Mes 4-6 | Mes 7-12 |
|----------|---------|---------|----------|
| Efectivo disponible | $2,000 | $1,500 | $3,000 |
| Cuentas por cobrar | $0 | $500 | $2,000 |
| Inventario (licencias prepagadas) | $0 | $0 | $500 |
| Cuentas por pagar | $500 | $800 | $1,200 |
| **Capital de trabajo neto** | **$1,500** | **$1,200** | **$4,300** |

### 14.5 Desglose de Costos de Puesta en Marcha

| Categoria | Costo (USD) | % del Total |
|-----------|-------------|-------------|
| Tecnologia y equipos | $1,500 | 37% |
| Legal y administrativo | $800 | 20% |
| Marketing y ventas inicial | $600 | 15% |
| Capital de trabajo | $1,000 | 24% |
| Contingencia (10%) | $200 | 5% |
| **Total** | **$4,100** | **100%** |

---

## 15. Conclusion

### 15.1 Resumen del Proyecto
DocuMind AI es una startup tecnologica panamena que resuelve un problema real y cuantificable: las empresas pierden miles de horas anuales buscando informacion en documentos internos. Mediante inteligencia artificial (RAG + embeddings + LLMs open source), DocuMind convierte documentos estaticos en conocimiento accionable, citando la fuente exacta con precision de archivo, pagina y parrafo.

El proyecto se fundamenta en conceptos clave de la materia de Innovacion y Emprendimiento Empresarial: innovacion tecnologica, modelo de negocio SaaS escalable, transformacion digital de procesos empresariales, liderazgo innovador y trabajo en equipo.

### 15.2 Fortalezas del Proyecto
1. **Tecnologia probada:** El stack RAG es tecnologia de vanguardia en 2026, utilizada por empresas como Microsoft, Google y startups de Y Combinator.
2. **Mercado validado:** El 95% de empresas en Panama son MIPYMES sin herramientas para gestion documental inteligente.
3. **Equipo capacitado:** Desarrolladores con experiencia en IA, pipelines de datos y desarrollo web moderno.
4. **Costo de entrada bajo:** $4,100 de inversion inicial, operable con recursos propios (bootstrapping).
5. **Escalabilidad:** Modelo SaaS con margenes crecientes (33% ano 1 → 60% ano 3).

### 15.3 Proximos Pasos
1. **Semana 1:** Completar MVP funcional para presentacion semestral.
2. **Mes 1:** Lanzar landing page y capturar 100 emails de waitlist.
3. **Mes 2-3:** Onboarding de 10 empresas pilotos en Panama.
4. **Mes 4-6:** Iterar producto basado en feedback, lanzar version 1.0 publica.
5. **Mes 7-12:** Escalar a 100 clientes pagos, expandir equipo.
6. **Ano 2:** Expansion a Costa Rica y Colombia, levantar ronda semilla.

### 15.4 Llamado a la Accion
DocuMind AI no es solo un chatbot de PDFs. Es el **Sistema Operativo del Conocimiento Empresarial** que transformara como las empresas latinoamericanas gestionan su informacion. Con una inversion inicial de $4,100, un mercado de $45M alcanzable, y un equipo comprometido, estamos listos para convertir el caos documental en productividad.

> "Innovar no es solo crear algo nuevo, es crear algo que valga la pena." — DocuMind AI

---

## REFERENCIAS

1. AMPYME — Autoridad de la Micro, Pequena y Mediana Empresa de Panama. Datos estadisticos de MIPYMES 2026.
2. La Prensa Panama. "MiPymes: motor clave del 70% de la economia panamena." 28 de abril de 2026.
3. Ministerio de Comercio e Industrias de Panama. Ley No. 16 de 2008 (Ley de MIPYMES).
4. Gartner Research. "Enterprise Document Management Market Analysis 2026."
5. LangChain Documentation. "Retrieval-Augmented Generation (RAG) Best Practices." 2026.
6. Groq Cloud. "API Documentation — Llama 3.1 Models." 2026.
7. ChromaDB. "Vector Database for AI Applications." 2026.
8. Materials de clase: Glosario de Innovacion y Emprendimiento Empresarial, UTP 2026.
9. Materials de clase: Importancia de las MIPYMES en Panama, UTP 2026.
10. Materials de clase: Modulo I — Filosofia del Emprendedor, UTP 2026.

---

## ANEXOS

### Anexo A: Documentos de Demo Completos

(Ver Seccion 6.2 — los 5 PDFs de Constructora Nova S.A. estan completamente escritos y listos para exportar a Word/PDF)

### Anexo B: Preguntas de Demo con Respuestas

(Ver Seccion 6.4 — tabla de 10 preguntas con respuestas esperadas, documentos y paginas exactas)

### Anexo C: Prompt de Sistema del LLM

(Ver Seccion 7.4 — prompt completo para Groq API)

### Anexo D: Diagrama de Arquitectura

(Ver Seccion 4.4 y 7.2 — diagramas ASCII de arquitectura y pipeline RAG)

### Anexo E: Business Model Canvas

| Bloque | Contenido |
|--------|-----------|
| Propuesta de valor | Sistema Operativo del Conocimiento Empresarial con citas exactas |
| Segmentos de clientes | Despachos legales, consultoras, constructoras, universidades, bancos |
| Canales | Landing page, LinkedIn, alianzas AMPYME, Camara de Comercio |
| Relaciones | Soporte por email, CSM dedicado (Enterprise), comunidad online |
| Fuentes de ingreso | Subscripcion SaaS mensual/anual |
| Recursos clave | Codigo propietario, embeddings locales, marca, equipo tecnico |
| Actividades clave | Desarrollo de IA, ventas B2B, soporte al cliente, marketing digital |
| Alianzas | AMPYME, Camara de Comercio, universidades, consultoras tecnologicas |
| Estructura de costos | Infraestructura cloud, marketing, salarios, legal |

### Anexo F: Glosario de Terminos

(Ver Seccion 15 del PRD original o Glosario de clase)

---

**Fin del PRD v3.0**

*Documento preparado para generacion de plan.md, landing page, documento Word y pitch deck mediante Opus 4.8 en iteraciones separadas.*
*Prioridad: Ejecucion funcional en 7 dias. Demo impresionante. Pitch que vende la vision.*
