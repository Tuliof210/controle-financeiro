import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { type MouseEvent, useEffect, useRef } from "react";
import { useNavActive } from "../../nav.hook.ts";
import styles from "./style.module.scss";

interface UseAsideProps {
  collapsed: boolean;
  drawerOpen: boolean;
  onToggle: () => void;
  onCloseDrawer: () => void;
}

export function useAside({
  collapsed,
  drawerOpen,
  onToggle,
  onCloseDrawer,
}: UseAsideProps) {
  const { items, isActive } = useNavActive();
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Below `md` only — see style.module.scss's `[open]` scoping. showModal()
  // gives the drawer focus-trap + Esc + ::backdrop for free, mirroring
  // src/components/Modal/hook.ts; from `md` up CSS shows this element
  // regardless of the native `open` attribute, so this never runs there.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (drawerOpen && !dialog.open) {
      dialog.showModal();
    } else if (!drawerOpen && dialog.open) {
      dialog.close();
    }
  }, [drawerOpen]);

  // Close on navigation — a link inside the drawer changes the route without
  // ever calling onCloseDrawer itself. `pathname` is a re-run trigger, not
  // read in the body, hence the lint exception.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is intentionally dependency-only, to close on every route change.
  useEffect(() => {
    onCloseDrawer();
  }, [pathname, onCloseDrawer]);

  const handleClose = () => {
    if (drawerOpen) {
      onCloseDrawer();
    }
  };

  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) {
      onCloseDrawer();
    }
  };

  return {
    ref,
    items,
    isActive,
    collapsed,
    onToggle,
    handleClose,
    handleClick,
    className: [styles.aside, collapsed && styles.collapsed]
      .filter(Boolean)
      .join(" "),
    toggleIcon: collapsed ? PanelLeftOpen : PanelLeftClose,
    toggleLabel: collapsed ? "Expandir menu" : "Recolher menu",
  };
}
