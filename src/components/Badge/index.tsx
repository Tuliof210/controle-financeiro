import { Icon } from "@/components/Icon/index.tsx";
import { type BadgeProps, useBadge } from "./hook.ts";
import styles from "./style.module.scss";

export function Badge(props: BadgeProps) {
  const { className, icon, iconSize, dot, children } = useBadge(props);

  return (
    <span className={className}>
      {Boolean(dot) && <span className={styles.dot} />}
      {icon !== undefined && <Icon name={icon} size={iconSize} />}
      {children}
    </span>
  );
}
