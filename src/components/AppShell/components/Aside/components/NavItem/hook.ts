import type { LucideIcon } from "lucide-react";
import styles from "./style.module.scss";

interface UseNavItemProps {
  href: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  icon: LucideIcon;
}

export function useNavItem({
  href,
  label,
  active,
  collapsed,
  icon,
}: UseNavItemProps) {
  return {
    href,
    label,
    active,
    icon,
    className: [styles.link, collapsed && styles.collapsed]
      .filter(Boolean)
      .join(" "),
  };
}
