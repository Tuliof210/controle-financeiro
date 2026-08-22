import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { MvIconName } from "@/components/Icon/hook.ts";
import { useNavActive } from "../../nav.hook.ts";
import styles from "./style.module.scss";

interface UseAsideProps {
  collapsed: boolean;
  drawerOpen: boolean;
  onToggle: () => void;
  onCloseDrawer: () => void;
}

// The control says what it will DO, so both the glyph and the label name the
// state it switches to.
function toggleIconFor(collapsed: boolean): MvIconName {
  if (collapsed) {
    return "panelLeftOpen";
  }
  return "panelLeftClose";
}

function toggleLabelFor(collapsed: boolean): string {
  if (collapsed) {
    return "Expandir menu";
  }
  return "Recolher menu";
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

  // Backdrop click, bound through the ref for the same reason as
  // src/components/Modal/hook.ts: an onClick prop on a non-interactive element
  // is what a11y linting flags, and the drawer's keyboard path is Esc.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    const onBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) {
        onCloseDrawer();
      }
    };
    dialog.addEventListener("click", onBackdrop);
    return () => dialog.removeEventListener("click", onBackdrop);
  }, [onCloseDrawer]);

  return {
    ref,
    items,
    isActive,
    collapsed,
    onToggle,
    handleClose,
    className: [styles.aside, collapsed && styles.collapsed]
      .filter(Boolean)
      .join(" "),
    toggleIcon: toggleIconFor(collapsed),
    toggleLabel: toggleLabelFor(collapsed),
  };
}
