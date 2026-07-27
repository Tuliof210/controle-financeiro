import { usePathname } from "next/navigation";
import { isActiveNav, NAV } from "../../nav";

export function useBottomNav() {
  const pathname = usePathname();

  return {
    items: NAV,
    isActive: (href: string) => isActiveNav(pathname, href),
  };
}
