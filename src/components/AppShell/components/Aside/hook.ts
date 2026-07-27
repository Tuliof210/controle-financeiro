import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useNavActive } from "../../nav.hook";
import styles from "./style.module.scss";

type UseAsideProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function useAside({ collapsed, onToggle }: UseAsideProps) {
  const { items, isActive } = useNavActive();

  return {
    items,
    isActive,
    collapsed,
    onToggle,
    className: [styles.aside, collapsed && styles.collapsed]
      .filter(Boolean)
      .join(" "),
    ToggleIcon: collapsed ? PanelLeftOpen : PanelLeftClose,
    toggleLabel: collapsed ? "Expandir menu" : "Recolher menu",
  };
}
