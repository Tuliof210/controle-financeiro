import { type SectionCardProps, useSectionCard } from "./hook";
import styles from "./style.module.scss";

export function SectionCard(props: SectionCardProps) {
  const { title, icon: Icon, children } = useSectionCard(props);

  return (
    <section className={styles.card}>
      <div className={styles.titleRow}>
        {Icon ? <Icon size={18} aria-hidden /> : null}
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
