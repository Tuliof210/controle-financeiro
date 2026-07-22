import Link from "next/link";
import { useNavItem } from "./hook";
import styles from "./style.module.scss";

type NavItemProps = {
  href: string;
  label: string;
  active: boolean;
};

export function NavItem(props: NavItemProps) {
  const { href, label, active } = useNavItem(props);

  return (
    <li>
      <Link
        href={href}
        className={styles.link}
        aria-current={active ? "page" : undefined}
      >
        {label}
      </Link>
    </li>
  );
}
