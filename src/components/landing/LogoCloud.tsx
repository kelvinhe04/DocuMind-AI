export function LogoCloud() {
  const tech = [
    { name: "Groq", desc: "LLM inference" },
    { name: "ChromaDB", desc: "Vector store" },
    { name: "Clerk", desc: "Auth" },
    { name: "Stripe", desc: "Pagos" },
    { name: "Tesseract", desc: "OCR" },
    { name: "FastAPI", desc: "Backend" },
  ];

  return (
    <section className="bg-slate-950 border-y border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-8">
          Tecnologías de clase mundial que impulsan DocuMind
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
          {tech.map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-1 opacity-40 hover:opacity-70 transition-opacity">
              <span className="text-sm font-bold text-white tracking-tight">{t.name}</span>
              <span className="text-[10px] text-slate-500">{t.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
