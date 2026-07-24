import { type SectionCardProps, useSectionCard } from "./hook";
import styles from "./style.module.scss";

export function SectionCard(props: SectionCardProps) {
  const { title, icon: Icon, tone, children } = useSectionCard(props);
  const titleRowClassName = [styles.titleRow, tone && styles[tone]]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={styles.card}>
      <div className={titleRowClassName}>
        {Icon ? <Icon size={18} aria-hidden /> : null}
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
