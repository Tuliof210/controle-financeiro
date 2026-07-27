import Link from "next/link";
import { useBottomNav } from "./hook";
import styles from "./style.module.scss";

// The mobile counterpart of Aside. Only one of the two is ever displayed, and
// `display: none` removes the other from the accessibility tree, so both can
// carry the same landmark name without duplicating it.
export function BottomNav() {
  const { items, isActive } = useBottomNav();

  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      {items.map(({ href, short, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={styles.item}
          aria-current={isActive(href) ? "page" : undefined}
          aria-label={label}
        >
          <Icon size={19} aria-hidden />
          <span>{short}</span>
        </Link>
      ))}
    </nav>
  );
}
