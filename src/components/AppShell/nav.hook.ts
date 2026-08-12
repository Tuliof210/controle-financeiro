import { usePathname } from "next/navigation";
import { isActiveNav, NAV } from "./nav.ts";

// Role-suffixed, not `hook.ts`: a folder's hook.ts is called by its own
// index.tsx, and this one is called by Aside's hook.
export function useNavActive() {
  const pathname = usePathname();

  return {
    items: NAV,
    isActive: (href: string) => isActiveNav(pathname, href),
  };
}
