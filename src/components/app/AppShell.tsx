import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";

// Shell de la app autenticada (sidebar + topbar + contenido).
// Se usa como wrapper en cada página protegida en lugar de un layout de grupo
// (los route groups no se registran de forma fiable en este setup de Next 14.2 + Windows).
export function AppShell({ children, noPadding }: { children: React.ReactNode; noPadding?: boolean }) {
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col min-h-0">
        <Topbar />
        <main className={noPadding ? "flex flex-1 min-h-0 overflow-hidden" : "flex-1 overflow-y-auto p-6 flex flex-col"}>
          {children}
        </main>
      </div>
    </div>
  );
}
