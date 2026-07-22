import { NavItem } from "./components/NavItem";
import { useAside } from "./hook";
import styles from "./style.module.scss";

type AsideProps = {
  open: boolean;
};

export function Aside({ open }: AsideProps) {
  const { topItems, bottomItem, pathname } = useAside();

  return (
    <aside
      id="app-sidebar"
      className={styles.aside}
      aria-label="Navegação principal"
      hidden={!open}
    >
      <div className={styles.brand}>CF</div>
      <nav className={styles.nav}>
        <ul className={styles.top}>
          {topItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={pathname === item.href}
            />
          ))}
        </ul>
        <ul className={styles.bottom}>
          <NavItem {...bottomItem} active={pathname === bottomItem.href} />
        </ul>
      </nav>
    </aside>
  );
}
