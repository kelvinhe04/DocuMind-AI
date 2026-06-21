"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    desc: "Para empezar a explorar",
    features: [
      "3 documentos",
      "20 consultas / mes",
      "Solo PDFs con texto",
      "Búsqueda semántica",
      "Soporte por email",
    ],
    cta: "Comenzar gratis",
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter",
    monthly: 49,
    desc: "Para equipos pequeños",
    features: [
      "Documentos ilimitados",
      "Consultas ilimitadas",
      "OCR (imágenes + PDFs escaneados)",
      "Chat con citas exactas",
      "Analytics básicos",
      "Soporte prioritario",
    ],
    cta: "Elegir Starter",
    highlight: true,
    badge: "Más popular",
  },
  {
    id: "business",
    name: "Business",
    monthly: 199,
    desc: "Para empresas medianas",
    features: [
      "Todo de Starter",
      "Multi-workspace (3 espacios)",
      "Roles y permisos avanzados",
      "Analytics avanzados",
      "API access",
      "SLA 99.9%",
    ],
    cta: "Elegir Business",
    highlight: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: 999,
    desc: "Infraestructura propia",
    features: [
      "Todo de Business",
      "Workspaces ilimitados",
      "On-premise deployment",
      "SSO / SAML",
      "Integración custom",
      "Soporte dedicado 24/7",
    ],
    cta: "Contactar ventas",
    highlight: false,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const disc = 0.83;

  return (
    <section id="pricing" className="bg-slate-950 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
            Precios
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Planes para cada empresa
          </h2>
          <p className="mt-4 text-slate-400">
            Empieza gratis. Escala cuando necesites más poder.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 bg-slate-900 border border-white/10 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`text-sm px-5 py-2 rounded-full transition-all ${
                !annual ? "bg-violet-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`text-sm px-5 py-2 rounded-full transition-all flex items-center gap-2 ${
                annual ? "bg-violet-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Anual
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                −17%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => {
            const price = plan.monthly === 0 ? 0 : annual ? Math.round(plan.monthly * disc) : plan.monthly;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.highlight
                    ? "gradient-border bg-slate-900"
                    : "glass"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      <Zap className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-400">{plan.name}</h3>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">${price}</span>
                    <span className="text-slate-500 mb-1 text-sm">
                      {plan.monthly === 0 ? "/ siempre" : "/ mes"}
                    </span>
                  </div>
                  {annual && plan.monthly > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">
                      ${plan.monthly * 12 * disc}/año — ahorras ${Math.round(plan.monthly * 12 * 0.17)}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">{plan.desc}</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.id === "enterprise" ? "#cta" : "/sign-up"}
                  className={`block text-center text-sm font-semibold py-3 rounded-xl transition-all ${
                    plan.highlight
                      ? "bg-violet-600 hover:bg-violet-500 text-white"
                      : plan.monthly === 0
                      ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                      : "border border-white/10 hover:border-violet-500/50 text-slate-300 hover:text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          Todos los planes incluyen modo extractivo como fallback — la app nunca se cae sin API key de Groq.
        </p>
      </div>
    </section>
  );
}
