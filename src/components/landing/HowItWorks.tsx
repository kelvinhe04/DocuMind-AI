"use client";

import { motion } from "framer-motion";
import { Upload, MessageCircle, BookOpen } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Sube tus documentos",
    desc: "PDF, Word, imágenes escaneadas. DocuMind extrae el texto (con OCR si aplica), lo divide en fragmentos y lo indexa en nuestra base vectorial.",
    color: "from-violet-600 to-violet-400",
  },
  {
    num: "02",
    icon: MessageCircle,
    title: "Pregunta en lenguaje natural",
    desc: "Escribe tu pregunta como si le hablaras a un colega. '¿Cuántos días de preaviso exige el contrato?' o '¿Cuál es el canon de arrendamiento?'",
    color: "from-cyan-600 to-cyan-400",
  },
  {
    num: "03",
    icon: BookOpen,
    title: "Obtén respuestas con citas",
    desc: "La IA responde con el fragmento más relevante y te indica exactamente de qué documento y página proviene la información. Cero alucinaciones.",
    color: "from-emerald-600 to-emerald-400",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-950 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            Cómo funciona
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            De documento a respuesta en segundos
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Tres pasos simples para transformar tu base documental en un activo inteligente.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="absolute top-0 -right-3 text-4xl font-black text-slate-800 select-none">
                  {step.num}
                </span>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
