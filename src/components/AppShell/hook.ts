import { useCallback, useEffect, useState } from "react";

// $breakpoints.md in src/styles/_theme.scss — the only place JS needs that
// number too; kept in sync by hand, there is no shared source for both.
const DESKTOP = "(min-width: 768px)";

export function useAppShell() {
  const [rawCollapsed, setRawCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Mobile-first default, corrected once this effect runs client-side — same
  // hydration-seam pattern Header's clock-derived text already uses.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP);
    const sync = () => {
      setIsDesktop(mql.matches);
      // A live resize across the stop must drop any open drawer, or it stays
      // a real top-layer modal (Aside/hook.ts's showModal()) blocking the
      // page behind what CSS now draws as the plain sticky rail.
      if (mql.matches) setDrawerOpen(false);
    };
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggle = useCallback(
    () => (isDesktop ? setRawCollapsed((c) => !c) : setDrawerOpen((o) => !o)),
    [isDesktop],
  );

  return {
    // Only ever true at desktop width, so nothing downstream has to guard
    // against a stale desktop collapse leaking into the drawer.
    collapsed: isDesktop && rawCollapsed,
    drawerOpen,
    closeDrawer,
    expanded: isDesktop ? !rawCollapsed : drawerOpen,
    toggle,
  };
}
