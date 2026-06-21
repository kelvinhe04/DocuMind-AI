"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Menu, X } from "lucide-react";
import Link from "next/link";

const links = [
  { href: "#features", label: "Características" },
  { href: "#how-it-works", label: "Cómo funciona" },
  { href: "#pricing", label: "Precios" },
  { href: "#demo", label: "Demo" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center group-hover:bg-violet-500 transition-colors">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            DocuMind <span className="text-violet-400">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-lg transition-colors"
          >
            Comenzar gratis
          </Link>
        </div>

        <button
          className="md:hidden text-slate-300 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden glass border-t border-white/10"
          >
            <div className="px-4 pt-3 pb-4 space-y-2">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm text-slate-300 hover:text-white py-2 transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  className="text-sm text-center text-slate-300 hover:text-white py-2 border border-white/10 rounded-lg transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/sign-up"
                  className="text-sm font-semibold text-center bg-emerald-500 hover:bg-emerald-400 text-white py-2 rounded-lg transition-colors"
                >
                  Comenzar gratis
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
