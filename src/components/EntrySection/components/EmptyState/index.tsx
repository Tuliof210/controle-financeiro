import { Icon } from "@/components/Icon/index.tsx";
import { type EmptyStateProps, useEmptyState } from "./hook.ts";
import styles from "./style.module.scss";

export function EmptyState(props: EmptyStateProps) {
  const { icon, title, hint } = useEmptyState(props);

  return (
    <div className={styles.empty}>
      {/* Decorative only — the two paragraphs below carry the meaning. */}
      <div className={styles.box}>
        <Icon name={icon} size={20} />
      </div>
      <p className={styles.title}>{title}</p>
      <p className={styles.hint}>{hint}</p>
    </div>
  );
}
