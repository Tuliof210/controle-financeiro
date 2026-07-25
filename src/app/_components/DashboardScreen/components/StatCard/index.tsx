import { SectionCard } from "@/components/SectionCard";
import { type StatCardProps, useStatCard } from "./hook";
import styles from "./style.module.scss";

export function StatCard(props: StatCardProps) {
  const { title, icon, hint, glyph, total, tone, rows } = useStatCard(props);

  return (
    <SectionCard title={title} icon={icon} tone={tone} hint={hint}>
      <dl className={styles.rows}>
        {/* The headline is a labelled figure like the other four, not a bare
            number — otherwise the biggest value on the card is the only one a
            screen reader announces without a name. */}
        <div className={styles.totalRow}>
          <dt className={styles.label}>Valor total</dt>
          <dd className={`${styles.total} ${tone ? styles[tone] : ""}`}>
            {glyph ? <span aria-hidden>{glyph} </span> : null}
            {total}
          </dd>
        </div>
        {rows.map((row) => (
          <div className={styles.row} key={row.key}>
            <dt className={styles.label}>{row.label}</dt>
            <dd className={styles.value}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}
