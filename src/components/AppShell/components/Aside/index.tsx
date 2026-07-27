import { BrandMark } from "../BrandMark";
import { NavItem } from "./components/NavItem";
import { useAside } from "./hook";
import styles from "./style.module.scss";

type AsideProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function Aside(props: AsideProps) {
  const {
    items,
    isActive,
    collapsed,
    onToggle,
    className,
    ToggleIcon,
    toggleLabel,
  } = useAside(props);

  return (
    <aside id="app-sidebar" className={className}>
      <div className={styles.brand}>
        <BrandMark />
        <span className={styles.brandText}>
          <span className={styles.brandName}>MONEVO</span>
          <span className={styles.brandTag}>PANORAMA FINANCEIRO</span>
        </span>
      </div>

      <nav className={styles.nav} aria-label="Navegação principal">
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
      </nav>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.collapse}
          aria-label={toggleLabel}
          aria-expanded={!collapsed}
          onClick={onToggle}
        >
          <ToggleIcon className={styles.collapseIcon} size={18} aria-hidden />
          <span className={styles.collapseLabel}>{toggleLabel}</span>
        </button>
      </div>
    </aside>
  );
}
