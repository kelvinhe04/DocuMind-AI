import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Upload,
  Search,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const APP_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/upload", label: "Subir", icon: Upload },
  { href: "/search", label: "Búsqueda", icon: Search },
];

export const APP_NAV_BOTTOM: NavItem[] = [
  { href: "/billing", label: "Facturación", icon: CreditCard },
];

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "Chat",
  "/documents": "Documentos",
  "/upload": "Subir documento",
  "/search": "Búsqueda semántica",
  "/billing": "Facturación",
  "/pricing": "Planes",
};
