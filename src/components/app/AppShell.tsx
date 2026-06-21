import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";

// Shell de la app autenticada (sidebar + topbar + contenido).
// Se usa como wrapper en cada página protegida en lugar de un layout de grupo
// (los route groups no se registran de forma fiable en este setup de Next 14.2 + Windows).
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
