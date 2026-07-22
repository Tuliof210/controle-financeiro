import {
  ArrowLeftRight,
  LayoutDashboard,
  Repeat,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";

const TOP_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { href: "/recorrencias", label: "Recorrências", icon: Repeat },
];

const BOTTOM_ITEM = {
  href: "/configuracoes",
  label: "Configurações",
  icon: Settings,
};

export function useAside() {
  const pathname = usePathname();
  return { topItems: TOP_ITEMS, bottomItem: BOTTOM_ITEM, pathname };
}
