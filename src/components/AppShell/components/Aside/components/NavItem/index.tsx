import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useNavItem } from "./hook.ts";
import styles from "./style.module.scss";

interface NavItemProps {
  href: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  icon: LucideIcon;
}

export function NavItem(props: NavItemProps) {
  const { href, label, active, icon: Icon, className } = useNavItem(props);

  return (
    <li>
      {/* aria-label duplicates the visible label because the collapsed rail
          takes the <span> out of the a11y tree with `display: none` — without
          it an icon-only link would have no accessible name. */}
      <Link
        href={href}
        className={className}
        aria-current={active ? "page" : undefined}
        aria-label={label}
      >
        <Icon className={styles.icon} size={18} aria-hidden />
        <span className={styles.label}>{label}</span>
      </Link>
    </li>
  );
}
