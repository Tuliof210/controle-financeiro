import { usePathname } from "next/navigation";

const TOP_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/movimentacoes", label: "Movimentações" },
  { href: "/recorrencias", label: "Recorrências" },
];

const BOTTOM_ITEM = { href: "/configuracoes", label: "Configurações" };

export function useAside() {
  const pathname = usePathname();
  return { topItems: TOP_ITEMS, bottomItem: BOTTOM_ITEM, pathname };
}
