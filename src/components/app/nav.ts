import {
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  Upload,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const APP_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/upload", label: "Subir", icon: Upload },
  { href: "/search", label: "Busqueda", icon: Search },
];

export const APP_NAV_BOTTOM: NavItem[] = [
  { href: "/billing", label: "Facturacion", icon: CreditCard },
];

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "Chat",
  "/documents": "Documentos",
  "/upload": "Subir documento",
  "/search": "Busqueda semantica",
  "/billing": "Facturacion",
  "/pricing": "Planes",
};
