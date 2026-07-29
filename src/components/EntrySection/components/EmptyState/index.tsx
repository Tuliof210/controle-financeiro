import { type EmptyStateProps, useEmptyState } from "./hook";
import styles from "./style.module.scss";

export function EmptyState(props: EmptyStateProps) {
  const { icon: Icon, title, hint } = useEmptyState(props);

  return (
    <div className={styles.empty}>
      {/* Decorative only — the two paragraphs below carry the meaning. */}
      <div className={styles.box}>
        <Icon size={20} aria-hidden />
      </div>
      <p className={styles.title}>{title}</p>
      <p className={styles.hint}>{hint}</p>
    </div>
  );
}
