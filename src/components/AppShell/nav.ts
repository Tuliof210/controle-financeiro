import {
  ArrowLeftRight,
  FileUp,
  LayoutDashboard,
  ListTree,
  type LucideIcon,
  Settings,
  TrendingUp,
} from "lucide-react";

export interface NavEntry {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV: NavEntry[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { href: "/previsoes", label: "Previsões", icon: TrendingUp },
  { href: "/leitor-ofx", label: "Leitor OFX", icon: FileUp },
  { href: "/ofx-decoder", label: "OFX Decoder", icon: ListTree },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

// Exact equality, never prefix matching: no destination here is nested under
// another, and "/" is a prefix of every path — startsWith would light up the
// Dashboard item on all six screens.
export function isActiveNav(pathname: string, href: string): boolean {
  return pathname === href;
}
