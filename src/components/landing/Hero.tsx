"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 pt-16">
      <div className="absolute inset-0 dot-grid opacity-60" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-violet-700/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-emerald-700/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ahora con OCR — lee documentos escaneados e imágenes
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
          >
            El cerebro digital{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              de tu empresa
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-6 text-lg text-slate-400 leading-relaxed max-w-lg"
          >
            Convierte PDFs, contratos e imágenes en conocimiento accionable. Haz preguntas en
            lenguaje natural y obtén respuestas con citas exactas, impulsadas por IA.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm"
            >
              Comenzar gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-violet-500/50 text-slate-300 hover:text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-sm"
            >
              Ver demo en vivo
            </a>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-6 text-xs text-slate-500"
          >
            Sin tarjeta de crédito · 3 documentos gratis para siempre
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-3xl blur-xl" />
            <div className="relative glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-slate-500">DocuMind AI — Chat</span>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-slate-300">K</span>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl rounded-tl-none px-4 py-2.5 text-sm text-slate-300 max-w-xs">
                    ¿Cuántos días de preaviso exige el contrato?
                  </div>
                </div>

                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-violet-700 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-violet-900/50 border border-violet-700/30 rounded-xl rounded-tr-none px-4 py-2.5 text-sm text-slate-200 max-w-xs">
                    El contrato establece un preaviso de{" "}
                    <span className="text-violet-300 font-semibold">30 días</span> para terminación
                    sin causa justificada.{" "}
                    <span className="text-violet-400/70 text-xs">
                      Fuente: Contrato_Laboral_Nova_2026.pdf, p.3
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-slate-300">K</span>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl rounded-tl-none px-4 py-2.5 text-sm text-slate-300 max-w-xs">
                    ¿Cuántas cotizaciones pide política de compras?
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 pl-10">
                  <Zap className="w-3 h-3 text-violet-400 animate-pulse" />
                  DocuMind está escribiendo...
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {["Días de vacaciones", "Canon de arrendamiento", "Causales de despido"].map(
                  (q) => (
                    <span
                      key={q}
                      className="text-xs bg-slate-800 border border-white/5 text-slate-400 px-2.5 py-1 rounded-full cursor-pointer hover:border-violet-500/40 hover:text-violet-300 transition-colors"
                    >
                      {q}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 border-2 border-slate-600 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-slate-500 rounded-full" />
        </div>
      </div>
    </section>
  );
}

function Brain({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.122 6.003 6.003 0 003 5.25M9.75 3.104a24.301 24.301 0 00-4.5.082M5 14.5a6.003 6.003 0 003 5.25m0 0a6.003 6.003 0 006 0m-6 0v2.25m6-2.25v2.25m0 0a6.003 6.003 0 003-5.25M14.25 8.82a2.25 2.25 0 001.5-2.122V3.186"
      />
    </svg>
  );
}
