"use client";

import { motion } from "framer-motion";
import { Search, MessageSquare, ScanLine, BarChart3, Building2, Server } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Búsqueda semántica",
    desc: "Encuentra información por significado, no solo palabras clave. Comprende el contexto de tus consultas.",
    accent: "violet",
  },
  {
    icon: MessageSquare,
    title: "Chat con citas exactas",
    desc: 'Cada respuesta incluye la fuente y página exacta: "Contrato_Laboral.pdf, p.3". Sin alucinaciones.',
    accent: "violet",
  },
  {
    icon: ScanLine,
    title: "OCR inteligente",
    desc: "Extrae texto de PDFs escaneados e imágenes con Tesseract. Convierte documentos físicos en conocimiento digital.",
    accent: "amber",
  },
  {
    icon: BarChart3,
    title: "Analytics en tiempo real",
    desc: "Dashboard con métricas de uso: documentos indexados, consultas, almacenamiento y actividad histórica.",
    accent: "emerald",
  },
  {
    icon: Building2,
    title: "Multi-workspace",
    desc: "Separa proyectos, clientes o departamentos. Cada workspace con sus propios documentos y usuarios. (Roadmap Q3)",
    accent: "slate",
    badge: "Próximamente",
  },
  {
    icon: Server,
    title: "On-premise ready",
    desc: "Despliega en tu propia infraestructura. Tus documentos confidenciales nunca salen de tus servidores. (Roadmap Q4)",
    accent: "slate",
    badge: "Roadmap",
  },
];

const accentMap: Record<string, string> = {
  violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  slate: "bg-slate-800/50 text-slate-400 border-slate-700/30",
};

export function Features() {
  return (
    <section id="features" className="bg-slate-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
            Características
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Todo lo que necesitas para dominar tus documentos
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Desde PDFs complejos hasta facturas escaneadas, DocuMind AI procesa, indexa y responde
            con precisión empresarial.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            const accentClass = accentMap[f.accent];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass rounded-2xl p-6 group cursor-default"
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${accentClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white">{f.title}</h3>
                  {f.badge && (
                    <span className="text-[10px] bg-slate-800 text-slate-500 border border-slate-700 px-2 py-0.5 rounded-full flex-shrink-0">
                      {f.badge}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
