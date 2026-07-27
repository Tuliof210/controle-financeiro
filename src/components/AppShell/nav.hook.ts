import { usePathname } from "next/navigation";
import { isActiveNav, NAV } from "./nav";

// Role-suffixed, not `hook.ts`: a folder's hook.ts is called by its own
// index.tsx, and this one is called by Aside's and BottomNav's hooks. Same
// reason nav.ts exists — the rail and the bottom nav must not drift apart on
// what "active" means, and that includes how they resolve it, not just the
// comparison itself.
export function useNavActive() {
  const pathname = usePathname();

  return {
    items: NAV,
    isActive: (href: string) => isActiveNav(pathname, href),
  };
}
