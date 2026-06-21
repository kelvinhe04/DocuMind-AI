import { SignUp } from "@clerk/nextjs";
import { clerkDarkAppearance } from "@/lib/clerkAppearance";
import { Brain } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-700/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[300px] bg-cyan-700/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand header */}
      <div className="relative mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-600/20 border border-violet-500/20">
          <Brain className="size-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">DocuMind AI</h1>
          <p className="mt-1 text-sm text-slate-400">3 documentos gratis · Sin tarjeta de crédito</p>
        </div>
      </div>

      {/* Clerk card */}
      <div className="relative w-full max-w-sm">
        <SignUp appearance={clerkDarkAppearance} />
      </div>

      {/* Footer */}
      <p className="relative mt-8 text-xs text-slate-600">
        © 2026 DocuMind AI · Todos los derechos reservados
      </p>
    </div>
  );
}
