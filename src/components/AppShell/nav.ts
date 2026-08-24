import type { MvIconName } from "@/components/Icon/hook.ts";

export interface NavEntry {
  href: string;
  label: string;
  icon: MvIconName;
}

export const NAV: NavEntry[] = [
  { href: "/", label: "Dashboard", icon: "layoutDashboard" },
  { href: "/movimentacoes", label: "Movimentações", icon: "arrowLeftRight" },
  { href: "/previsoes", label: "Previsões", icon: "trendingUp" },
  { href: "/leitor-ofx", label: "Leitor OFX", icon: "fileUp" },
  { href: "/configuracoes", label: "Configurações", icon: "settings" },
];

// Exact equality, never prefix matching: no destination here is nested under
// another, and "/" is a prefix of every path — startsWith would light up the
// Dashboard item on all five screens.
export function isActiveNav(pathname: string, href: string): boolean {
  return pathname === href;
}
