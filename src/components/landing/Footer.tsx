import { Brain } from "lucide-react";
import Link from "next/link";

const cols = [
  {
    title: "Producto",
    links: [
      { label: "Características", href: "#features" },
      { label: "Precios", href: "#pricing" },
      { label: "Demo", href: "#demo" },
      { label: "Roadmap", href: "#" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Acerca de", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contacto", href: "#cta" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidad", href: "#" },
      { label: "Términos", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">
                DocuMind <span className="text-violet-400">AI</span>
              </span>
            </Link>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              El cerebro digital de tu empresa. Búsqueda semántica y chat con citas exactas sobre
              tus documentos.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-600">
              © 2026 DocuMind AI
            </p>
        </div>
      </div>
    </footer>
  );
}
