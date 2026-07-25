import { SectionCard } from "@/components/SectionCard";
import { type StatCardProps, useStatCard } from "./hook";
import styles from "./style.module.scss";

export function StatCard(props: StatCardProps) {
  const { title, icon, hint, glyph, total, tone, rows } = useStatCard(props);

  return (
    <SectionCard title={title} icon={icon} tone={tone} hint={hint}>
      <p className={`${styles.total} ${tone ? styles[tone] : ""}`}>
        {glyph ? <span aria-hidden>{glyph} </span> : null}
        {total}
      </p>
      <dl className={styles.rows}>
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
