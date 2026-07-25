import { Tooltip } from "@/components/Tooltip";
import { type SectionCardProps, useSectionCard } from "./hook";
import styles from "./style.module.scss";

export function SectionCard(props: SectionCardProps) {
  const { title, icon: Icon, tone, hint, children } = useSectionCard(props);
  const titleRowClassName = [styles.titleRow, tone && styles[tone]]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={styles.card}>
      <div className={titleRowClassName}>
        {Icon ? <Icon size={18} aria-hidden /> : null}
        <h2 className={styles.title}>{title}</h2>
        {hint ? (
          // Named after the card: a dashboard renders many of these, and a
          // generic label would list them all identically to a screen reader.
          <Tooltip text={hint} label={`Como ${title} é calculado`} />
        ) : null}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
