"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Documentos procesados", color: "text-violet-400" },
  { value: "10k+", label: "Preguntas respondidas", color: "text-cyan-400" },
  { value: "50+", label: "Empresas en waitlist", color: "text-emerald-400" },
  { value: "99.2%", label: "Precisión en citas", color: "text-amber-400" },
];

export function Stats() {
  return (
    <section className="bg-slate-950 border-y border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="text-center"
            >
              <p className={`text-4xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="mt-2 text-sm text-slate-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
