import type { MvIconName } from "@/components/Icon/hook.ts";
import styles from "./style.module.scss";

interface UseNavItemProps {
  href: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  icon: MvIconName;
}

// `undefined` removes the attribute; "page" is only correct on the active link,
// so the two states cannot be written as one boolean.
function ariaCurrent(active: boolean): "page" | undefined {
  if (active) {
    return "page";
  }
}

export function useNavItem({
  href,
  label,
  active,
  collapsed,
  icon,
}: UseNavItemProps) {
  return {
    currentPage: ariaCurrent(active),
    href,
    label,
    active,
    icon,
    className: [styles.link, collapsed && styles.collapsed]
      .filter(Boolean)
      .join(" "),
  };
}
