"""
Genera los 7 documentos demo de Constructora Nova S.A.
Salida: backend/data/demo/

Documentos:
  001 Contrato_Laboral_Nova_2026.pdf       pdf_text  (4 páginas)
  002 Manual_RRHH_Nova.pdf                 pdf_text  (6 páginas)
  003 Reglamento_Interno_Nova.pdf          pdf_text  (3 páginas)
  004 Contrato_Arrendamiento_Oficina.pdf   pdf_text  (3 páginas)
  005 Politica_Compras_Proveedores.pdf     pdf_text  (4 páginas)
  006 Acta_Reunion_Directiva_Nova.jpg      image_ocr (imagen)
  007 Factura_Servicios_Enero_2026.pdf     pdf_ocr   (imagen embebida en PDF)

Uso:
  cd backend
  python scripts/generate_demo_docs.py
"""

import os
import sys

# Para importar core.config cuando el script se ejecuta directamente
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from io import BytesIO

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas as rl_canvas

# ---------------------------------------------------------------------------
# Ruta de salida
# ---------------------------------------------------------------------------
DEMO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "samples"))


def _ensure_dir() -> None:
    os.makedirs(DEMO_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Helper: fuente TTF para Pillow
# ---------------------------------------------------------------------------
def _pil_font(size: int = 18) -> ImageFont.FreeTypeFont:
    candidates = [
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
        "C:/Windows/Fonts/verdana.ttf",
        "C:/Windows/Fonts/cour.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


# ---------------------------------------------------------------------------
# Helper: PDF de texto con reportlab (control exacto de página)
# ---------------------------------------------------------------------------
def _make_text_pdf(dest: str, pages: list[list[str]]) -> None:
    """
    pages: lista de páginas; cada página es una lista de strings.
    Cada elemento puede tener prefijos de estilo:
      "TITLE: texto"  → Helvetica-Bold 18
      "HEAD: texto"   → Helvetica-Bold 13
      "SUB: texto"    → Helvetica-Oblique 11
      ""              → línea en blanco
      cualquier otro  → Helvetica 11
    """
    c = rl_canvas.Canvas(dest, pagesize=letter)
    W, H = letter
    L_MARGIN = 2.5 * cm
    R_MARGIN = W - 2.5 * cm
    MAX_W = R_MARGIN - L_MARGIN

    def write_line(canvas_obj, x, y, text, font, size, color=(0.1, 0.1, 0.1)):
        canvas_obj.setFont(font, size)
        canvas_obj.setFillColorRGB(*color)
        # Word-wrap manual
        words = text.split()
        line = ""
        for word in words:
            test = f"{line} {word}".strip()
            if canvas_obj.stringWidth(test, font, size) > MAX_W:
                canvas_obj.drawString(x, y, line)
                y -= size + 3
                line = word
            else:
                line = test
        if line:
            canvas_obj.drawString(x, y, line)
            y -= size + 3
        return y

    for page_lines in pages:
        y = H - 2 * cm
        for raw in page_lines:
            if y < 2.5 * cm:
                # No debería pasar si gestionamos bien el contenido
                break
            if raw == "":
                y -= 10
                continue
            if raw.startswith("TITLE:"):
                text = raw[6:].strip()
                y = write_line(c, L_MARGIN, y, text, "Helvetica-Bold", 18, (0.05, 0.05, 0.35))
                # Línea decorativa
                c.setStrokeColorRGB(0.3, 0.3, 0.7)
                c.setLineWidth(0.8)
                c.line(L_MARGIN, y + 2, R_MARGIN, y + 2)
                y -= 8
            elif raw.startswith("HEAD:"):
                text = raw[5:].strip()
                y -= 6
                y = write_line(c, L_MARGIN, y, text, "Helvetica-Bold", 13, (0.1, 0.1, 0.1))
                y -= 2
            elif raw.startswith("SUB:"):
                text = raw[4:].strip()
                y = write_line(c, L_MARGIN, y, text, "Helvetica-Oblique", 11, (0.4, 0.4, 0.4))
            elif raw.startswith("HR"):
                c.setStrokeColorRGB(0.7, 0.7, 0.7)
                c.setLineWidth(0.5)
                c.line(L_MARGIN, y, R_MARGIN, y)
                y -= 8
            else:
                y = write_line(c, L_MARGIN, y, raw, "Helvetica", 11)
        c.showPage()

    c.save()


# ---------------------------------------------------------------------------
# Helper: imagen JPG con texto (para OCR)
# ---------------------------------------------------------------------------
def _make_image_doc(dest: str, lines: list[str], width: int = 1240, height: int = 1754) -> None:
    """Renderiza texto sobre fondo blanco; simula un documento escaneado."""
    img = Image.new("RGB", (width, height), color=(252, 250, 248))
    draw = ImageDraw.Draw(img)

    font_h1 = _pil_font(32)
    font_h2 = _pil_font(24)
    font_body = _pil_font(20)
    font_small = _pil_font(16)

    MARGIN_X = 80
    y = 80

    for line in lines:
        if y > height - 100:
            break
        if line == "":
            y += 18
        elif line.startswith("H1:"):
            text = line[3:].strip()
            draw.text((MARGIN_X, y), text, fill=(15, 15, 80), font=font_h1)
            y += 45
            draw.line([(MARGIN_X, y), (width - MARGIN_X, y)], fill=(100, 100, 200), width=2)
            y += 14
        elif line.startswith("H2:"):
            text = line[3:].strip()
            draw.text((MARGIN_X, y), text, fill=(30, 30, 30), font=font_h2)
            y += 36
        elif line.startswith("HR"):
            draw.line([(MARGIN_X, y + 8), (width - MARGIN_X, y + 8)], fill=(180, 180, 180), width=1)
            y += 22
        elif line.startswith("SMALL:"):
            text = line[6:].strip()
            draw.text((MARGIN_X, y), text, fill=(90, 90, 90), font=font_small)
            y += 24
        else:
            # Word-wrap a ~105 chars equivalentes
            max_w = width - 2 * MARGIN_X
            words = line.split()
            cur = ""
            for word in words:
                test = f"{cur} {word}".strip()
                bbox = draw.textbbox((0, 0), test, font=font_body)
                if bbox[2] > max_w and cur:
                    draw.text((MARGIN_X, y), cur, fill=(20, 20, 20), font=font_body)
                    y += 30
                    cur = word
                else:
                    cur = test
            if cur:
                draw.text((MARGIN_X, y), cur, fill=(20, 20, 20), font=font_body)
                y += 30

    # Sello de empresa en la esquina
    draw.text((width - 280, height - 80), "CONSTRUCTORA NOVA S.A.", fill=(150, 150, 200), font=font_small)

    img.save(dest, "JPEG", quality=92)


# ---------------------------------------------------------------------------
# Helper: PDF escaneado (imagen embebida → pdf_ocr)
# ---------------------------------------------------------------------------
def _make_scanned_pdf(dest: str, lines: list[str]) -> None:
    tmp = dest.replace(".pdf", "__tmp.jpg")
    _make_image_doc(tmp, lines, width=1240, height=1754)

    W_page, H_page = letter  # puntos reportlab
    c = rl_canvas.Canvas(dest, pagesize=letter)
    c.drawImage(tmp, 0, 0, width=W_page, height=H_page, preserveAspectRatio=False)
    c.showPage()
    c.save()

    # Liberar el handle antes de eliminar (Windows)
    try:
        os.remove(tmp)
    except OSError:
        pass


# ===========================================================================
# DOCUMENTOS DEMO
# ===========================================================================

def _doc001_contrato_laboral() -> None:
    """
    Contrato_Laboral_Nova_2026.pdf — 4 páginas
    Q4: preaviso 30 días (p.3) | Q7: seguro médico emergencias 100% (p.4)
    """
    pages = [
        # Página 1 — Portada
        [
            "TITLE: CONTRATO INDIVIDUAL DE TRABAJO",
            "CONSTRUCTORA NOVA S.A.",
            "SUB: Contrato N.° 2026-001",
            "",
            "Entre los suscritos: CONSTRUCTORA NOVA S.A., sociedad anónima",
            "inscrita en el Registro Público de Panamá, representada en este",
            "acto por su Gerente General, Sr. Carlos Méndez Pino, con cédula",
            "de identidad personal N.° 8-333-1234, a quien en adelante se",
            "denominará EL EMPLEADOR; y el trabajador identificado en la",
            "cláusula primera, a quien se denominará EL TRABAJADOR.",
            "",
            "Se celebra el presente Contrato Individual de Trabajo, de",
            "conformidad con el Código de Trabajo de la República de Panamá,",
            "bajo los términos y condiciones que a continuación se estipulan.",
            "",
            "SUB: Ciudad de Panamá, 15 de enero de 2026",
        ],
        # Página 2 — Cláusulas generales
        [
            "TITLE: CLÁUSULAS DEL CONTRATO",
            "",
            "HEAD: CLÁUSULA PRIMERA — IDENTIFICACIÓN DE LAS PARTES",
            "El trabajador es Sr./Sra. __________________, titular de la",
            "cédula de identidad personal N.° _______________, con domicilio",
            "en ________________________________, Ciudad de Panamá.",
            "",
            "HEAD: CLÁUSULA SEGUNDA — CARGO Y FUNCIONES",
            "El trabajador desempeñará el cargo de __________________ en la",
            "sede principal de la empresa ubicada en Ave. Balboa, Edificio",
            "Nova Center, piso 8, Ciudad de Panamá.",
            "Las funciones específicas serán determinadas por el supervisor",
            "inmediato y el Manual de Funciones vigente de la empresa.",
            "",
            "HEAD: CLÁUSULA TERCERA — REMUNERACIÓN",
            "El trabajador recibirá una remuneración mensual de",
            "B/. ______________ (Balboas), pagadera de forma quincenal",
            "los días 15 y último de cada mes.",
            "",
            "HEAD: CLÁUSULA CUARTA — JORNADA LABORAL",
            "La jornada de trabajo será de lunes a viernes de 8:00 a.m. a",
            "5:00 p.m., con una hora de descanso para almuerzo de 12:00 m.",
            "a 1:00 p.m. La jornada ordinaria no excederá de 8 horas diarias",
            "ni 48 horas semanales.",
        ],
        # Página 3 — Preaviso y terminación (Q4: 30 días)
        [
            "TITLE: TERMINACIÓN Y PREAVISO",
            "",
            "HEAD: CLÁUSULA DÉCIMA — PREAVISO DE RENUNCIA",
            "En caso de que el trabajador decida dar por terminada la",
            "relación laboral de manera voluntaria, deberá notificar al",
            "empleador con un preaviso mínimo de TREINTA (30) días",
            "calendario de anticipación.",
            "",
            "El período de preaviso de 30 días calendario es obligatorio",
            "conforme al Artículo 75 del Código de Trabajo panameño.",
            "Durante dicho período, el trabajador continuará prestando",
            "sus servicios con normalidad.",
            "",
            "El incumplimiento del preaviso de 30 días dará lugar a que",
            "el trabajador indemnice al empleador con el salario",
            "correspondiente al período no trabajado.",
            "",
            "HEAD: CLÁUSULA DÉCIMO PRIMERA — CAUSALES DE TERMINACIÓN",
            "El contrato podrá darse por terminado por causas justificadas",
            "conforme a lo establecido en el Código de Trabajo de Panamá,",
            "incluyendo falta grave de las obligaciones del contrato,",
            "negligencia manifiesta, o cualquier otra conducta sancionada",
            "por la legislación laboral vigente.",
            "",
            "HEAD: CLÁUSULA DÉCIMO SEGUNDA — LIQUIDACIÓN",
            "A la terminación del contrato, la empresa liquidará al",
            "trabajador conforme a la ley, incluyendo décimo tercer mes,",
            "vacaciones proporcionales y demás beneficios acumulados.",
        ],
        # Página 4 — Beneficios (Q7: seguro médico 100%)
        [
            "TITLE: BENEFICIOS Y PRESTACIONES",
            "",
            "HEAD: CLÁUSULA DÉCIMO TERCERA — SEGURO MÉDICO",
            "Constructora Nova S.A. proveerá al trabajador y a su núcleo",
            "familiar directo una póliza de seguro médico colectivo con",
            "la aseguradora nacional autorizada.",
            "",
            "La cobertura del seguro médico para casos de EMERGENCIAS",
            "será del CIEN POR CIENTO (100%) del costo de la atención,",
            "sin deducible aplicable en situaciones de emergencia médica",
            "debidamente certificada por el médico tratante.",
            "",
            "Cobertura para emergencias: 100% sin límite de monto.",
            "Cobertura para consultas generales: 80% del costo.",
            "Cobertura para especialistas: 70% del costo.",
            "Cobertura para medicamentos recetados: 60% del costo.",
            "",
            "HEAD: CLÁUSULA DÉCIMO CUARTA — OTROS BENEFICIOS",
            "Décimo tercer mes conforme al Código de Trabajo.",
            "Prima de antigüedad a partir del año 1 de servicio.",
            "Bonificación anual por desempeño según evaluación.",
            "Subsidio de alimentación de B/. 150.00 mensuales.",
            "Transporte corporativo en rutas designadas.",
            "",
            "HR",
            "SUB: Firmado en Ciudad de Panamá el 15 de enero de 2026.",
            "SUB: Constructora Nova S.A. — RUC 155-123456-2-2026",
        ],
    ]
    _make_text_pdf(os.path.join(DEMO_DIR, "Contrato_Laboral_Nova_2026.pdf"), pages)


def _doc002_manual_rrhh() -> None:
    """
    Manual_RRHH_Nova.pdf — 6 páginas
    Q6: horario L-V 8am-5pm (p.2) | Q1: 17 días vacaciones a 2 años (p.4) | Q8: causales despido (p.6)
    """
    pages = [
        # Página 1 — Portada Manual
        [
            "TITLE: MANUAL DE RECURSOS HUMANOS",
            "CONSTRUCTORA NOVA S.A.",
            "",
            "SUB: Versión 3.2 — Revisado: enero 2026",
            "SUB: Departamento de Recursos Humanos",
            "",
            "Este manual establece las políticas, normas y procedimientos",
            "de gestión del talento humano de Constructora Nova S.A. Es de",
            "aplicación obligatoria para todos los colaboradores activos,",
            "independientemente de su nivel jerárquico o modalidad de",
            "contratación.",
            "",
            "La versión actualizada de este Manual prevalece sobre",
            "versiones anteriores y deberá ser consultada como referencia",
            "primaria en asuntos de recursos humanos.",
            "",
            "HEAD: ÍNDICE",
            "Capítulo 1 — Reclutamiento y Selección",
            "Capítulo 2 — Jornada Laboral y Horarios",
            "Capítulo 3 — Remuneración y Beneficios",
            "Capítulo 4 — Vacaciones y Permisos",
            "Capítulo 5 — Evaluación de Desempeño",
            "Capítulo 6 — Disciplina y Terminación",
        ],
        # Página 2 — Jornada y Horario (Q6: 8am-5pm)
        [
            "TITLE: CAPÍTULO 2 — JORNADA LABORAL Y HORARIOS",
            "",
            "HEAD: 2.1 Horario Oficial de Trabajo",
            "El horario oficial de trabajo para todos los colaboradores",
            "administrativos de Constructora Nova S.A. es:",
            "",
            "LUNES A VIERNES: 8:00 a.m. a 5:00 p.m.",
            "(Jornada diurna de 8 horas con 1 hora de almuerzo)",
            "",
            "Hora de entrada: 8:00 a.m.",
            "Hora de salida: 5:00 p.m.",
            "Horario de almuerzo: 12:00 m. — 1:00 p.m.",
            "Sábados, domingos y feriados: NO laborables (salvo acuerdo).",
            "",
            "HEAD: 2.2 Puntualidad",
            "Se considerará tardanza a la llegada después de las 8:10 a.m.",
            "Tres tardanzas en un mes equivaldrán a una falta justificada.",
            "El registro de asistencia es obligatorio mediante el sistema",
            "biométrico instalado en la entrada principal.",
            "",
            "HEAD: 2.3 Horas Extra",
            "Las horas trabajadas más allá del horario de lunes a viernes",
            "de 8:00 a.m. a 5:00 p.m. serán reconocidas como horas extra",
            "con recargo del 25% (jornada diurna) o 50% (nocturna/festivo)",
            "conforme al Código de Trabajo de Panamá.",
        ],
        # Página 3 — Remuneración y Salarios
        [
            "TITLE: CAPÍTULO 3 — REMUNERACIÓN Y BENEFICIOS",
            "",
            "HEAD: 3.1 Estructura Salarial",
            "Los salarios se estructuran en bandas salariales aprobadas",
            "anualmente por la Gerencia General y el Comité de",
            "Compensaciones, alineadas con el mercado local.",
            "",
            "HEAD: 3.2 Beneficios Económicos Fijos",
            "Décimo tercer mes: pagado en tres cuotas (abril, agosto, dic.)",
            "Prima de antigüedad: 1.92% por año de servicio sobre salario.",
            "Subsidio de alimentación: B/. 150.00 mensuales.",
            "Seguro médico colectivo (ver Contrato Individual).",
            "Seguro de vida: cobertura equivalente a 12 salarios mensuales.",
            "",
            "HEAD: 3.3 Período de Prueba",
            "Los primeros 90 días de la relación laboral constituyen el",
            "período de prueba, durante el cual cualquiera de las partes",
            "puede dar por terminada la relación sin responsabilidad.",
            "",
            "HEAD: 3.4 Incrementos Salariales",
            "Los incrementos anuales dependerán de la evaluación de",
            "desempeño y la situación financiera de la empresa.",
            "La evaluación se realiza cada mes de diciembre.",
        ],
        # Página 4 — Vacaciones (Q1: 17 días hábiles a 2 años)
        [
            "TITLE: CAPÍTULO 4 — VACACIONES Y PERMISOS",
            "",
            "HEAD: 4.1 Derecho a Vacaciones",
            "Todo trabajador tiene derecho a vacaciones remuneradas",
            "conforme al Código de Trabajo de la República de Panamá y",
            "la política interna de Constructora Nova S.A.",
            "",
            "HEAD: 4.2 Tabla de Vacaciones por Antigüedad",
            "Antigüedad de 1 año cumplido:     30 días calendario (ley mín.)",
            "Antigüedad de 2 años cumplidos:   17 DÍAS HÁBILES de vacaciones",
            "Antigüedad de 3 a 5 años:         20 días hábiles de vacaciones",
            "Antigüedad de 6 a 10 años:        25 días hábiles de vacaciones",
            "Antigüedad de más de 10 años:     30 días hábiles de vacaciones",
            "",
            "IMPORTANTE: El trabajador con 2 años de servicio en",
            "Constructora Nova S.A. tiene derecho a 17 días hábiles",
            "de vacaciones anuales remuneradas, adicionales a los",
            "feriados nacionales y días de descanso semanal.",
            "",
            "HEAD: 4.3 Programación de Vacaciones",
            "Las vacaciones deben ser solicitadas con 30 días de",
            "anticipación mediante el formulario RH-VAC-01.",
            "La aprobación corresponde al supervisor inmediato y RRHH.",
            "",
            "HEAD: 4.4 Permisos Especiales",
            "Matrimonio: 3 días hábiles.",
            "Fallecimiento de familiar directo: 3 días hábiles.",
            "Paternidad: 3 días hábiles conforme a la ley panameña.",
        ],
        # Página 5 — Evaluación de Desempeño
        [
            "TITLE: CAPÍTULO 5 — EVALUACIÓN DE DESEMPEÑO",
            "",
            "HEAD: 5.1 Proceso de Evaluación",
            "Constructora Nova S.A. aplica un sistema de evaluación de",
            "desempeño semestral (junio y diciembre) con las siguientes",
            "dimensiones: calidad del trabajo, cumplimiento de objetivos,",
            "trabajo en equipo, iniciativa e innovación.",
            "",
            "HEAD: 5.2 Escala de Calificación",
            "Sobresaliente (5): Supera ampliamente los objetivos.",
            "Excelente (4): Supera los objetivos establecidos.",
            "Satisfactorio (3): Cumple con los objetivos.",
            "Necesita mejorar (2): Cumple parcialmente los objetivos.",
            "Insatisfactorio (1): No cumple los objetivos.",
            "",
            "HEAD: 5.3 Consecuencias de la Evaluación",
            "Calificación Sobresaliente o Excelente: bonificación anual",
            "de hasta el 10% del salario anual.",
            "Calificación Satisfactoria: ajuste salarial según presupuesto.",
            "Calificación Necesita Mejorar: plan de mejora de 90 días.",
            "Calificación Insatisfactoria dos períodos consecutivos:",
            "puede ser causal de terminación justificada.",
        ],
        # Página 6 — Disciplina y Causales de Despido (Q8)
        [
            "TITLE: CAPÍTULO 6 — DISCIPLINA Y TERMINACIÓN",
            "",
            "HEAD: 6.1 Régimen Disciplinario",
            "Las infracciones a las normas internas se sancionarán",
            "progresivamente: amonestación verbal, amonestación escrita,",
            "suspensión sin goce de salario (1-3 días), terminación.",
            "",
            "HEAD: 6.2 CAUSALES DE DESPIDO INMEDIATO",
            "Las siguientes conductas constituyen falta grave y son",
            "causales de DESPIDO INMEDIATO, sin responsabilidad para",
            "la empresa, conforme al Artículo 213 del Código de Trabajo:",
            "",
            "1. ROBO O HURTO: Sustracción de bienes de la empresa,",
            "   de compañeros o de clientes, en cualquier cuantía.",
            "2. VIOLENCIA FÍSICA O VERBAL: Agresión física o amenazas",
            "   graves a compañeros, supervisores o clientes.",
            "3. DIVULGACIÓN DE SECRETOS EMPRESARIALES: Revelar",
            "   información confidencial, datos de clientes o secretos",
            "   comerciales sin autorización de la gerencia.",
            "4. AUSENCIA INJUSTIFICADA: Tres (3) días consecutivos de",
            "   ausencia sin justificación documentada o aviso previo.",
            "",
            "HEAD: 6.3 Procedimiento de Despido",
            "El Gerente de RRHH y el supervisor documentarán la falta,",
            "notificarán al trabajador y emitirán la carta de despido con",
            "copia al MITRADEL conforme a la legislación vigente.",
            "",
            "SUB: Manual de RRHH v3.2 — Aprobado por Gerencia General — Enero 2026",
        ],
    ]
    _make_text_pdf(os.path.join(DEMO_DIR, "Manual_RRHH_Nova.pdf"), pages)


def _doc003_reglamento_interno() -> None:
    """
    Reglamento_Interno_Nova.pdf — 3 páginas
    Q2: renuncia sin preaviso → pérdida de beneficios (p.3)
    """
    pages = [
        # Página 1 — Portada
        [
            "TITLE: REGLAMENTO INTERNO DE TRABAJO",
            "CONSTRUCTORA NOVA S.A.",
            "",
            "SUB: Aprobado: MITRADEL Resolución N.° DL-2025-0847",
            "SUB: Vigencia: 1 de febrero de 2025",
            "",
            "El presente Reglamento Interno de Trabajo, elaborado de",
            "conformidad con los Artículos 68 al 74 del Código de Trabajo",
            "de la República de Panamá, es de cumplimiento obligatorio para",
            "todos los trabajadores de Constructora Nova S.A.",
            "",
            "HEAD: CAPÍTULOS",
            "Capítulo I   — Admisión e Inducción",
            "Capítulo II  — Normas de Conducta y Convivencia",
            "Capítulo III — Terminación de la Relación Laboral",
        ],
        # Página 2 — Normas de Conducta
        [
            "TITLE: CAPÍTULO II — NORMAS DE CONDUCTA",
            "",
            "HEAD: Artículo 15 — Obligaciones del Trabajador",
            "Son obligaciones de todo trabajador de Constructora Nova S.A.:",
            "a) Cumplir el horario establecido (L-V 8:00 a.m. - 5:00 p.m.).",
            "b) Tratar con respeto y profesionalismo a compañeros y clientes.",
            "c) Usar el equipo de protección personal en obra.",
            "d) Mantener el orden y limpieza en su puesto de trabajo.",
            "e) Reportar inmediatamente cualquier incidente o accidente.",
            "",
            "HEAD: Artículo 16 — Prohibiciones",
            "Queda expresamente prohibido a los trabajadores:",
            "a) Consumir bebidas alcohólicas o sustancias prohibidas.",
            "b) Ingresar a áreas restringidas sin autorización.",
            "c) Utilizar equipos de la empresa para fines personales.",
            "d) Divulgar información confidencial de la empresa o clientes.",
            "e) Recibir dádivas o regalos de proveedores o contratistas.",
            "",
            "HEAD: Artículo 17 — Uso de Dispositivos Electrónicos",
            "El uso de teléfonos celulares personales deberá limitarse",
            "durante la jornada laboral. En zonas de obra queda",
            "completamente prohibido su uso por razones de seguridad.",
        ],
        # Página 3 — Terminación y Consecuencias (Q2: sin preaviso = pérdida de beneficios)
        [
            "TITLE: CAPÍTULO III — TERMINACIÓN DE LA RELACIÓN LABORAL",
            "",
            "HEAD: Artículo 22 — Renuncia Voluntaria con Preaviso",
            "El trabajador que desee renunciar deberá presentar su carta",
            "de renuncia con el preaviso mínimo de 30 días calendario,",
            "conforme a lo establecido en el Contrato Individual de Trabajo",
            "y el Artículo 75 del Código de Trabajo de Panamá.",
            "",
            "HEAD: Artículo 23 — Renuncia Voluntaria SIN Preaviso",
            "CONSECUENCIAS: El trabajador que presente su renuncia",
            "voluntaria sin cumplir el preaviso de 30 días calendario",
            "incurrirá en la PÉRDIDA DE LOS SIGUIENTES BENEFICIOS:",
            "",
            "a) Pérdida del bono de permanencia anual acumulado.",
            "b) Pérdida del subsidio de transporte del mes en curso.",
            "c) Pérdida de la bonificación por desempeño pendiente.",
            "d) Obligación de indemnizar al empleador por los daños",
            "   causados al equivalente del salario del período no",
            "   trabajado del preaviso.",
            "",
            "La PÉRDIDA DE BENEFICIOS por renuncia sin preaviso aplica",
            "sin excepción, salvo casos de fuerza mayor debidamente",
            "documentados y aprobados por la Gerencia de RRHH.",
            "",
            "HEAD: Artículo 24 — Entrega del Puesto",
            "Independientemente de la modalidad de terminación, el",
            "trabajador deberá hacer entrega formal del puesto, equipo",
            "y documentación a cargo, firmando el acta de entrega.",
            "",
            "SUB: Reglamento Interno — Constructora Nova S.A. — 2025",
        ],
    ]
    _make_text_pdf(os.path.join(DEMO_DIR, "Reglamento_Interno_Nova.pdf"), pages)


def _doc004_contrato_arrendamiento() -> None:
    """
    Contrato_Arrendamiento_Oficina.pdf — 3 páginas
    Q3: plazo 24 meses (p.2) | Q9: canon $3,500 (p.3)
    """
    pages = [
        # Página 1 — Portada
        [
            "TITLE: CONTRATO DE ARRENDAMIENTO COMERCIAL",
            "",
            "SUB: Contrato N.° ARR-2025-004",
            "",
            "PARTES CONTRATANTES:",
            "",
            "ARRENDADOR: Inversiones Balboa Tower S.A., sociedad anónima",
            "inscrita bajo el Folio N.° 745231, representada por su",
            "Presidente, Sr. Ricardo Almeida Fuentes, con cédula",
            "8-256-9021.",
            "",
            "ARRENDATARIO: Constructora Nova S.A., sociedad anónima",
            "inscrita bajo el Folio N.° 423108, representada por su",
            "Gerente General, Sr. Carlos Méndez Pino, con cédula",
            "8-333-1234.",
            "",
            "Las partes acuerdan celebrar el presente Contrato de",
            "Arrendamiento Comercial sobre el inmueble descrito en",
            "las siguientes cláusulas, de conformidad con el Código",
            "Civil de la República de Panamá.",
        ],
        # Página 2 — Plazo (Q3: 24 meses)
        [
            "TITLE: PLAZO Y CONDICIONES DEL ARRENDAMIENTO",
            "",
            "HEAD: CLÁUSULA PRIMERA — OBJETO DEL CONTRATO",
            "El ARRENDADOR cede en arrendamiento al ARRENDATARIO",
            "el local comercial identificado como Oficina 8-A, ubicado",
            "en el piso 8 del Edificio Balboa Tower, Ave. Balboa,",
            "Ciudad de Panamá, con una superficie de 320 metros cuadrados.",
            "El local cuenta con 8 oficinas privadas, sala de juntas,",
            "área de recepción y 3 baños.",
            "",
            "HEAD: CLÁUSULA SEGUNDA — PLAZO DEL ARRENDAMIENTO",
            "El presente contrato tendrá una duración de VEINTICUATRO (24)",
            "MESES RENOVABLES, contados a partir del 1 de febrero de 2025.",
            "",
            "Fecha de inicio:       1 de febrero de 2025",
            "Fecha de vencimiento:  31 de enero de 2027",
            "Plazo total:           24 meses renovables",
            "",
            "Al vencimiento del plazo de 24 meses, el contrato se",
            "renovará automáticamente por períodos iguales, salvo que",
            "cualquiera de las partes notifique su decisión de no",
            "renovar con 60 días de anticipación.",
            "",
            "HEAD: CLÁUSULA TERCERA — USO DEL INMUEBLE",
            "El local arrendado será utilizado EXCLUSIVAMENTE para",
            "actividades de oficina administrativa de Constructora",
            "Nova S.A. Queda prohibido el uso para otros fines sin",
            "autorización escrita del Arrendador.",
        ],
        # Página 3 — Canon $3,500 (Q9)
        [
            "TITLE: CANON DE ARRENDAMIENTO Y PAGOS",
            "",
            "HEAD: CLÁUSULA CUARTA — CANON MENSUAL DE ARRENDAMIENTO",
            "El ARRENDATARIO se obliga a pagar al ARRENDADOR un canon",
            "mensual de arrendamiento de:",
            "",
            "TRES MIL QUINIENTOS DÓLARES AMERICANOS (USD $3,500.00)",
            "",
            "Canon mensual: $3,500.00 USD",
            "Forma de pago: transferencia bancaria",
            "Fecha de pago: los primeros 5 días hábiles de cada mes",
            "Cuenta beneficiaria: Inversiones Balboa Tower S.A.",
            "Banco Nacional de Panamá — Cuenta N.° 04-23-01-547832-6",
            "",
            "HEAD: CLÁUSULA QUINTA — AJUSTE DE CANON",
            "El canon de arrendamiento de $3,500.00 mensuales podrá",
            "ajustarse anualmente con base en el Índice de Precios al",
            "Consumidor (IPC) publicado por la Contraloría General de",
            "la República, con un ajuste máximo del 5% anual.",
            "",
            "HEAD: CLÁUSULA SEXTA — DEPÓSITO DE GARANTÍA",
            "Al firmar este contrato, el Arrendatario depositó la suma",
            "de $7,000.00 (equivalente a 2 meses de canon) en concepto",
            "de depósito de garantía, reembolsable al término del",
            "contrato previo inventario del local.",
            "",
            "SUB: Firmado en Ciudad de Panamá, 1 de febrero de 2025.",
        ],
    ]
    _make_text_pdf(os.path.join(DEMO_DIR, "Contrato_Arrendamiento_Oficina.pdf"), pages)


def _doc005_politica_compras() -> None:
    """
    Politica_Compras_Proveedores.pdf — 4 páginas
    Q10: 3 cotizaciones >$500 (p.3) | Q5: aprueba GG+Finanzas $3,000 (p.4)
    """
    pages = [
        # Página 1 — Portada
        [
            "TITLE: POLÍTICA DE COMPRAS Y PROVEEDORES",
            "CONSTRUCTORA NOVA S.A.",
            "",
            "SUB: Código: POL-CP-001 | Versión: 2.1 | Enero 2026",
            "SUB: Aprobado por: Comité Directivo — Gerencia General",
            "",
            "Esta política establece los lineamientos y procedimientos",
            "para la adquisición de bienes, servicios y materiales de",
            "construcción requeridos por Constructora Nova S.A., con el",
            "fin de garantizar transparencia, eficiencia y control en el",
            "gasto corporativo.",
            "",
            "HEAD: ALCANCE",
            "Aplica a todos los departamentos de la empresa que realicen",
            "solicitudes de compra, incluyendo Construcción, Diseño,",
            "Administración, Logística y Tecnología.",
            "",
            "HEAD: PRINCIPIOS RECTORES",
            "Transparencia en todos los procesos de selección.",
            "Mejor relación calidad-precio para la empresa.",
            "Igualdad de condiciones para todos los proveedores.",
            "Cumplimiento de normativas legales y fiscales.",
        ],
        # Página 2 — Proceso General
        [
            "TITLE: PROCESO GENERAL DE COMPRAS",
            "",
            "HEAD: Artículo 4 — Categorías de Compra",
            "Las compras se clasifican en tres categorías según monto:",
            "",
            "CATEGORÍA A — Compras menores (hasta $499.99):",
            "  Autorización directa del supervisor de área.",
            "  No requiere cotización formal.",
            "  Reembolso con factura en máx. 5 días hábiles.",
            "",
            "CATEGORÍA B — Compras intermedias ($500.00 — $2,999.99):",
            "  Requiere cotizaciones formales (ver Artículo 7).",
            "  Autorización del Jefe de Departamento.",
            "",
            "CATEGORÍA C — Compras mayores ($3,000.00 en adelante):",
            "  Requiere cotizaciones formales.",
            "  Autorización del Gerente General y Gerente de Finanzas.",
            "",
            "HEAD: Artículo 5 — Solicitud de Compra",
            "Toda compra debe iniciarse con el formulario SC-001 aprobado",
            "por el solicitante y su supervisor inmediato. Sin este",
            "formulario no se procesará ninguna orden de compra.",
            "",
            "HEAD: Artículo 6 — Registro de Proveedores",
            "Solo se podrá comprar a proveedores registrados en el",
            "catálogo oficial de Constructora Nova S.A. Los nuevos",
            "proveedores deben completar el formulario PR-REG-001.",
        ],
        # Página 3 — Cotizaciones >$500 (Q10: 3 cotizaciones)
        [
            "TITLE: PROCESO DE COTIZACIÓN",
            "",
            "HEAD: Artículo 7 — OBLIGATORIEDAD DE COTIZACIONES",
            "Para toda compra cuyo monto supere los QUINIENTOS DÓLARES",
            "AMERICANOS ($500.00 USD), el solicitante DEBERÁ obtener",
            "AL MENOS TRES (3) COTIZACIONES FORMALES de proveedores",
            "distintos antes de proceder con la compra.",
            "",
            "REGLA: Compras mayores a $500.00 → mínimo 3 cotizaciones",
            "",
            "Las tres cotizaciones deben ser:",
            "a) De proveedores diferentes y no relacionados entre sí.",
            "b) Emitidas en papel membretado con RUC del proveedor.",
            "c) Fechadas dentro de los últimos 30 días calendario.",
            "d) Con desglose de precio unitario, cantidad y total.",
            "e) Con condiciones de entrega y garantía especificadas.",
            "",
            "HEAD: Artículo 8 — Análisis de Cotizaciones",
            "El Departamento de Compras elaborará un cuadro comparativo",
            "con las 3 o más cotizaciones recibidas, evaluando:",
            "Precio total, tiempo de entrega, garantía del proveedor,",
            "historial de cumplimiento y condiciones de pago.",
            "",
            "HEAD: Artículo 9 — Excepciones",
            "Solo en casos de emergencia operativa debidamente justificados",
            "por el Gerente de área, se podrá prescindir de las 3",
            "cotizaciones. La justificación debe quedar documentada.",
        ],
        # Página 4 — Aprobaciones $3,000 (Q5: GG + Finanzas)
        [
            "TITLE: NIVELES DE APROBACIÓN",
            "",
            "HEAD: Artículo 10 — TABLA DE APROBACIONES POR MONTO",
            "",
            "Hasta $499.99:    Supervisor de Área",
            "De $500 a $2,999.99: Jefe de Departamento",
            "De $3,000 en adelante: GERENTE GENERAL + GERENTE DE FINANZAS",
            "",
            "HEAD: Artículo 11 — APROBACIONES PARA COMPRAS MAYORES A $3,000",
            "Las adquisiciones de bienes o servicios con un valor igual",
            "o superior a TRES MIL DÓLARES ($3,000.00 USD) requerirán",
            "la aprobación CONJUNTA de:",
            "",
            "1. GERENTE GENERAL (Sr. Carlos Méndez Pino)",
            "   Responsable de la aprobación estratégica.",
            "2. GERENTE DE FINANZAS (Sra. María Elena Quirós)",
            "   Responsable de verificar disponibilidad presupuestaria.",
            "",
            "Ambas firmas son OBLIGATORIAS para compras >= $3,000.",
            "Una sola firma no es suficiente para autorizar el gasto.",
            "La orden de compra sin ambas firmas será rechazada.",
            "",
            "HEAD: Artículo 12 — Registro y Archivo",
            "Todas las órdenes de compra aprobadas, con sus cotizaciones",
            "y documentación de respaldo, serán archivadas por el",
            "Departamento de Compras durante un mínimo de 5 años.",
            "",
            "SUB: Política de Compras v2.1 — Aprobada enero 2026 — Nova S.A.",
        ],
    ]
    _make_text_pdf(os.path.join(DEMO_DIR, "Politica_Compras_Proveedores.pdf"), pages)


def _doc006_acta_reunion_jpg() -> None:
    """
    Acta_Reunion_Directiva_Nova.jpg — image_ocr
    Q11: qué dice el acta sobre el presupuesto
    """
    lines = [
        "H1: ACTA DE REUNIÓN DE JUNTA DIRECTIVA",
        "H2: Constructora Nova S.A.",
        "HR",
        "",
        "Número de Acta: JD-2026-003",
        "Fecha: 12 de enero de 2026",
        "Hora: 9:00 a.m. — 11:30 a.m.",
        "Lugar: Sala de Juntas, Edificio Nova Center, Piso 8",
        "",
        "H2: PARTICIPANTES",
        "Presidente: Ing. Carlos Méndez Pino",
        "Vicepresidente: Lic. Sofía Arias Rodríguez",
        "Tesorera: CPA María Elena Quirós",
        "Secretaria: Arq. Jorge Padilla Muñoz",
        "Directora Comercial: Ing. Valentina Cruz Solano",
        "",
        "HR",
        "H2: PUNTOS TRATADOS",
        "",
        "PUNTO 1 — INFORME FINANCIERO TRIMESTRAL",
        "La Tesorera presentó el estado de resultados al 31 de diciembre",
        "de 2025. Ingresos acumulados: $2,450,000. Utilidad neta: $312,000.",
        "",
        "PUNTO 2 — APROBACIÓN DEL PRESUPUESTO ANUAL 2026",
        "Tras análisis y deliberación, la Junta Directiva aprobó por",
        "unanimidad el Presupuesto Operativo Anual 2026 por un monto",
        "total de B/. 3,200,000.00 (tres millones doscientos mil Balboas).",
        "",
        "Distribución presupuestaria aprobada:",
        "  - Construcción y obra civil:  $1,800,000  (56.25%)",
        "  - Nómina y beneficios:          $720,000  (22.50%)",
        "  - Equipos y maquinaria:         $400,000  (12.50%)",
        "  - Administración y RRHH:        $180,000   (5.62%)",
        "  - Marketing y ventas:           $100,000   (3.13%)",
        "",
        "PUNTO 3 — NUEVOS PROYECTOS",
        "Se aprobó la presentación de propuesta para el Proyecto Residencial",
        "Vista al Mar en Coronado, con inversión estimada de $950,000.",
        "",
        "PUNTO 4 — ACUERDOS",
        "Acuerdo 1: Aprobar presupuesto 2026 de $3,200,000.",
        "Acuerdo 2: Presentar propuesta Vista al Mar antes del 28 de febrero.",
        "Acuerdo 3: Contratar 2 ingenieros civiles adicionales en Q1-2026.",
        "",
        "HR",
        "Firma del Presidente: _____________________",
        "Firma de la Secretaria: _____________________",
        "SMALL: Acta aprobada y firmada — Constructora Nova S.A. — Enero 2026",
    ]
    _make_image_doc(os.path.join(DEMO_DIR, "Acta_Reunion_Directiva_Nova.jpg"), lines)


def _doc007_factura_pdf_ocr() -> None:
    """
    Factura_Servicios_Enero_2026.pdf — pdf_ocr (imagen embebida)
    Q12: cuánto dice la factura que se debe pagar
    """
    lines = [
        "H1: FACTURA DE SERVICIOS PROFESIONALES",
        "HR",
        "",
        "PROVEEDOR:",
        "TechSolutions de Panamá S.A.",
        "RUC: 155-234567-2-2023",
        "Tel: +507 396-8800",
        "Dirección: Calle 50, Edificio Metropolis, Of. 12-B",
        "Ciudad de Panamá, República de Panamá",
        "",
        "CLIENTE:",
        "Constructora Nova S.A.",
        "RUC: 155-123456-2-2020",
        "Dirección: Ave. Balboa, Edificio Nova Center, Piso 8",
        "",
        "HR",
        "H2: Número de Factura: FS-2026-0142",
        "H2: Fecha de emisión: 15 de enero de 2026",
        "H2: Fecha de vencimiento: 15 de febrero de 2026",
        "",
        "HR",
        "H2: DETALLE DE SERVICIOS PRESTADOS",
        "",
        "1. Licencia anual software ERP Construcción 2026   $4,200.00",
        "2. Implementación y configuración del módulo       $1,800.00",
        "3. Capacitación a 8 usuarios (16 horas)              $960.00",
        "4. Soporte técnico mensual — enero 2026              $350.00",
        "5. Backup y migración de datos históricos            $690.00",
        "",
        "HR",
        "Subtotal:                                          $8,000.00",
        "ITBMS (7%):                                          $560.00",
        "Descuento cliente frecuente (5%):                  - $400.00",
        "",
        "TOTAL A PAGAR:                                     $8,160.00",
        "",
        "H2: MONTO TOTAL A PAGAR: $8,160.00 USD",
        "(OCHO MIL CIENTO SESENTA DÓLARES AMERICANOS)",
        "",
        "HR",
        "Forma de pago: Transferencia bancaria",
        "Banco: Banistmo S.A.",
        "Cuenta: 0120-04-456789-0",
        "Beneficiario: TechSolutions de Panamá S.A.",
        "",
        "SMALL: Esta factura es válida como documento fiscal. Conserve para sus registros.",
        "SMALL: Vence: 15 de febrero de 2026. Mora: 2% mensual por retraso.",
    ]
    _make_scanned_pdf(os.path.join(DEMO_DIR, "Factura_Servicios_Enero_2026.pdf"), lines)


# ===========================================================================
# PUNTO DE ENTRADA
# ===========================================================================

def generate_all() -> list[str]:
    """Genera los 7 documentos demo. Retorna lista de paths creados."""
    _ensure_dir()

    generators = [
        ("Contrato_Laboral_Nova_2026.pdf", _doc001_contrato_laboral),
        ("Manual_RRHH_Nova.pdf", _doc002_manual_rrhh),
        ("Reglamento_Interno_Nova.pdf", _doc003_reglamento_interno),
        ("Contrato_Arrendamiento_Oficina.pdf", _doc004_contrato_arrendamiento),
        ("Politica_Compras_Proveedores.pdf", _doc005_politica_compras),
        ("Acta_Reunion_Directiva_Nova.jpg", _doc006_acta_reunion_jpg),
        ("Factura_Servicios_Enero_2026.pdf", _doc007_factura_pdf_ocr),
    ]

    created = []
    for filename, fn in generators:
        dest = os.path.join(DEMO_DIR, filename)
        if os.path.exists(dest):
            print(f"  [SKIP] {filename} ya existe")
            created.append(dest)
            continue
        try:
            fn()
            print(f"  [OK]   {filename}")
            created.append(dest)
        except Exception as exc:
            print(f"  [ERR]  {filename}: {exc}")

    return created


if __name__ == "__main__":
    print("Generando documentos demo de Constructora Nova S.A. ...")
    paths = generate_all()
    print(f"\n{len(paths)} archivo(s) en: {DEMO_DIR}")
