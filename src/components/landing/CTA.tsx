"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

export function CTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section id="cta" className="bg-slate-900 py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
            Lista de espera
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Únete a las{" "}
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              50+ empresas
            </span>{" "}
            que ya esperan
          </h2>
          <p className="mt-4 text-slate-400">
            Acceso anticipado, precio de fundador y onboarding personalizado para los primeros
            clientes.
          </p>

          <div className="mt-10">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-white font-semibold">¡Estás en la lista!</p>
                <p className="text-sm text-slate-400">
                  Te contactaremos en{" "}
                  <span className="text-emerald-400">{email}</span> cuando abramos el acceso.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="flex-1 bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm flex-shrink-0"
                >
                  Unirse
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <p className="mt-4 text-xs text-slate-600">
              Sin spam. Solo un correo cuando abramos tu acceso.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
