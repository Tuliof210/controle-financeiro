import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { isActiveNav, NAV } from "../../nav";
import styles from "./style.module.scss";

type UseAsideProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function useAside({ collapsed, onToggle }: UseAsideProps) {
  const pathname = usePathname();

  return {
    items: NAV,
    isActive: (href: string) => isActiveNav(pathname, href),
    collapsed,
    onToggle,
    className: [styles.aside, collapsed && styles.collapsed]
      .filter(Boolean)
      .join(" "),
    ToggleIcon: collapsed ? PanelLeftOpen : PanelLeftClose,
    toggleLabel: collapsed ? "Expandir menu" : "Recolher menu",
  };
}
