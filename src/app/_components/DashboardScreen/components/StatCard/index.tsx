import { SectionCard } from "@/components/SectionCard";
import { SPARK_H, SPARK_W } from "../../spark.helper";
import { Headline } from "../Headline";
import { type StatCardProps, useStatCard } from "./hook";
import styles from "./style.module.scss";

export function StatCard(props: StatCardProps) {
  const { title, icon, hint, glyph, total, tone, rows, spark, color } =
    useStatCard(props);

  // The corner marks hang off this wrapper rather than off SectionCard: 13
  // other call sites render that component and none of them wants them.
  return (
    <div className={styles.card}>
      <SectionCard title={title} icon={icon} tone={tone} hint={hint}>
        <div className={styles.head}>
          <Headline caption="Valor total no período" tone={tone}>
            {glyph ? <span aria-hidden>{glyph} </span> : null}
            {total}
          </Headline>
          {/* aria-hidden: the four rows below already carry every number the
              sparkline shows. */}
          {spark ? (
            <svg
              width={SPARK_W}
              height={SPARK_H}
              viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
              className={styles.spark}
            >
              <path d={spark.area} fill={color} opacity="0.12" />
              <path d={spark.line} stroke={color} strokeWidth="2" fill="none" />
            </svg>
          ) : null}
        </div>

        <dl className={styles.rows}>
          {rows.map((row) => (
            <div className={styles.row} key={row.key}>
              <dt className={styles.label}>{row.label}</dt>
              <dd className={styles.value}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>
    </div>
  );
}
