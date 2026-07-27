import {
  ArrowLeftRight,
  FileUp,
  LayoutDashboard,
  type LucideIcon,
  Repeat,
  Settings,
} from "lucide-react";

export type NavEntry = {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
};

// One definition, two consumers: the desktop rail (Aside) and the mobile
// BottomNav. `short` is the bottom-nav label — the full ones do not fit in a
// fifth of 375px.
export const NAV: NavEntry[] = [
  { href: "/", label: "Dashboard", short: "Painel", icon: LayoutDashboard },
  {
    href: "/movimentacoes",
    label: "Movimentações",
    short: "Mov.",
    icon: ArrowLeftRight,
  },
  {
    href: "/recorrencias",
    label: "Recorrências",
    short: "Fixos",
    icon: Repeat,
  },
  { href: "/leitor-ofx", label: "Leitor OFX", short: "OFX", icon: FileUp },
  {
    href: "/configuracoes",
    label: "Configurações",
    short: "Ajustes",
    icon: Settings,
  },
];

// Exact equality, never prefix matching: no destination here is nested under
// another, and "/" is a prefix of every path — startsWith would light up the
// Dashboard item on all five screens. Shared so the rail and the bottom nav
// cannot drift apart on what "active" means.
export function isActiveNav(pathname: string, href: string): boolean {
  return pathname === href;
}
