"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, FileText, MessageSquare, Search, BarChart3 } from "lucide-react";

export function DemoVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="demo" className="bg-slate-900 py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
            Demo
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Mira DocuMind en acción
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Sube un documento, haz una pregunta y obtén una respuesta con cita exacta en menos de 3
            segundos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <div className="absolute -inset-px bg-gradient-to-r from-violet-600/40 via-cyan-600/20 to-emerald-600/40 rounded-2xl" />
          <div className="relative glass rounded-2xl overflow-hidden aspect-video flex items-center justify-center min-h-[360px]">
            {!playing ? (
              <div className="text-center">
                <div className="mb-8 grid grid-cols-4 gap-4 px-12 opacity-30">
                  {[FileText, Search, MessageSquare, BarChart3].map((Icon, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="h-1.5 w-16 bg-slate-800 rounded" />
                      <div className="h-1.5 w-10 bg-slate-800 rounded" />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setPlaying(true)}
                  className="group relative w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Reproducir demo"
                >
                  <div className="absolute inset-0 rounded-full bg-violet-600/20 animate-ping" />
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </button>

                <p className="mt-6 text-sm text-slate-400">
                  Demo interactivo · 3 minutos · Sin registro
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-violet-700/30 border border-violet-500/30 flex items-center justify-center">
                  <Play className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-sm">
                  Video demo disponible en la presentación final del{" "}
                  <span className="text-violet-400">29/5/2026</span>
                </p>
                <button
                  onClick={() => setPlaying(false)}
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors mt-2"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          {[
            "📄 Subida con OCR",
            "💬 Chat con citas",
            "🔍 Búsqueda semántica",
            "💳 Pago Stripe en vivo",
          ].map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-800/80 border border-white/5 text-slate-400 px-4 py-2 rounded-full"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
