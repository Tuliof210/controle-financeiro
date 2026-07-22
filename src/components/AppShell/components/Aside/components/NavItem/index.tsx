import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useNavItem } from "./hook";
import styles from "./style.module.scss";

type NavItemProps = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
};

export function NavItem(props: NavItemProps) {
  const { href, label, active, icon: Icon } = useNavItem(props);

  return (
    <li>
      <Link
        href={href}
        className={styles.link}
        aria-current={active ? "page" : undefined}
      >
        <Icon className={styles.icon} size={18} aria-hidden />
        <span>{label}</span>
      </Link>
    </li>
  );
}
