import { Icon } from "@/components/Icon/index.tsx";
import { SIDEBAR_ID } from "../../ids.ts";
import { BrandMark } from "../BrandMark/index.tsx";
import { NavItem } from "./components/NavItem/index.tsx";
import { useAside } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  monevo: "MONEVO",
  panoramaFinanceiro: "PANORAMA FINANCEIRO",
  menu: "MENU",
} as const;

interface AsideProps {
  collapsed: boolean;
  drawerOpen: boolean;
  onToggle: () => void;
  onCloseDrawer: () => void;
}

export function Aside(props: AsideProps) {
  const {
    ref,
    items,
    isActive,
    collapsed,
    onToggle,
    handleClose,
    className,
    toggleIcon,
    toggleLabel,
  } = useAside(props);

  return (
    // role="navigation": this is a nav landmark at every width, a modal only
    // while the drawer is open below `md` — the native <dialog>'s implicit
    // "dialog" role would misdescribe the always-on desktop rail, and would
    // collide with an actual modal dialog open elsewhere on the same page.
    // biome-ignore lint/a11y/useSemanticElements: a plain <nav> has none of <dialog>'s showModal()/close()/Esc/::backdrop the drawer below `md` needs.
    <dialog
      id={SIDEBAR_ID}
      ref={ref}
      role="navigation"
      aria-label="Navegação principal"
      className={className}
      onClose={handleClose}
    >
      <div className={styles.brand}>
        <BrandMark />
        <span className={styles.brandText}>
          <span className={styles.brandName}>{COPY.monevo}</span>
          <span className={styles.brandTag}>{COPY.panoramaFinanceiro}</span>
        </span>
      </div>

      <div className={styles.nav}>
        <p className={styles.menu}>{COPY.menu}</p>
        <ul className={styles.list}>
          {items.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.collapse}
          aria-label={toggleLabel}
          aria-expanded={!collapsed}
          onClick={onToggle}
        >
          <Icon name={toggleIcon} className={styles.collapseIcon} size={18} />
          <span className={styles.collapseLabel}>{toggleLabel}</span>
        </button>
      </div>
    </dialog>
  );
}
