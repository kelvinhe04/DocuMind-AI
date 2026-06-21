"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "DocuMind nos ayudó a encontrar una cláusula crítica de preaviso en el contrato laboral en segundos. Lo que antes tomaba 20 minutos de búsqueda manual ahora son 3 segundos.",
    name: "Carlos Méndez",
    role: "Gerente de RRHH",
    company: "Constructora Nova S.A.",
    initials: "CM",
    color: "from-violet-600 to-violet-400",
  },
  {
    quote:
      "La precisión de las citas es impresionante. Para nuestros contratos legales, saber exactamente en qué página está la cláusula es fundamental. DocuMind lo hace perfecto.",
    name: "Ana García",
    role: "Socia Senior",
    company: "Bufete Méndez & Asociados",
    initials: "AG",
    color: "from-emerald-600 to-emerald-400",
  },
  {
    quote:
      "Procesamos más de 200 tesis en papel con el OCR de DocuMind. La calidad de extracción de texto superó nuestras expectativas. Increíble para documentos históricos.",
    name: "Dr. Roberto Fuentes",
    role: "Dir. Biblioteca Digital",
    company: "Universidad del Pacífico",
    initials: "RF",
    color: "from-cyan-600 to-cyan-400",
  },
];

export function Testimonials() {
  return (
    <section className="bg-slate-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            Testimonios
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Lo que dicen nuestros primeros usuarios
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-2xl p-6 flex flex-col gap-5"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-sm text-slate-300 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>

              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
