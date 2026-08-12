import { BrandMark } from "../BrandMark/index.tsx";
import { NavItem } from "./components/NavItem/index.tsx";
import { useAside } from "./hook.ts";
import styles from "./style.module.scss";

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
    handleClick,
    className,
    ToggleIcon,
    toggleLabel,
  } = useAside(props);

  return (
    // role="navigation": this is a nav landmark at every width, a modal only
    // while the drawer is open below `md` — the native <dialog>'s implicit
    // "dialog" role would misdescribe the always-on desktop rail, and would
    // collide with an actual modal dialog open elsewhere on the same page.
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is a mouse-only affordance; the native <dialog> already closes on Esc for keyboard users.
    // biome-ignore lint/a11y/useSemanticElements: a plain <nav> has none of <dialog>'s showModal()/close()/Esc/::backdrop the drawer below `md` needs.
    <dialog
      id="app-sidebar"
      ref={ref}
      role="navigation"
      aria-label="Navegação principal"
      className={className}
      onClose={handleClose}
      onClick={handleClick}
    >
      <div className={styles.brand}>
        <BrandMark />
        <span className={styles.brandText}>
          <span className={styles.brandName}>MONEVO</span>
          <span className={styles.brandTag}>PANORAMA FINANCEIRO</span>
        </span>
      </div>

      <div className={styles.nav}>
        <p className={styles.menu}>MENU</p>
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
          <ToggleIcon
            className={styles.collapseIcon}
            size={18}
            aria-hidden={true}
          />
          <span className={styles.collapseLabel}>{toggleLabel}</span>
        </button>
      </div>
    </dialog>
  );
}
