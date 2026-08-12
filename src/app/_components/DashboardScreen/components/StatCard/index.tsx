import { SectionCard } from "@/components/SectionCard/index.tsx";
import { SPARK_H, SPARK_W } from "../../spark.helper.ts";
import { Headline } from "../Headline/index.tsx";
import { type StatCardProps, useStatCard } from "./hook.ts";
import styles from "./style.module.scss";

export function StatCard(props: StatCardProps) {
  const { title, icon, hint, glyph, total, tone, band, rows, spark, color } =
    useStatCard(props);

  // The corner marks hang off this wrapper rather than off SectionCard: 13
  // other call sites render that component and none of them wants them.
  return (
    <div className={styles.card}>
      {/* `band`, not `tone`: the fill states what the tint used to, and the two
          on one row would only be a second place for the accent to be decided.
          `tone` still reaches Headline, where it colours the figure. */}
      <SectionCard title={title} icon={icon} band={band} hint={hint}>
        <Headline caption="Valor total no período" tone={tone}>
          {Boolean(glyph) && <span aria-hidden={true}>{glyph} </span>}
          {total}
        </Headline>

        <dl className={styles.rows}>
          {rows.map((row) => (
            <div className={styles.row} key={row.key}>
              <dt className={styles.label}>{row.label}</dt>
              <dd className={styles.value}>{row.value}</dd>
            </div>
          ))}
        </dl>

        {/* Last child and full-bleed, so the strip sits on the card's bottom
            edge the way the band sits on its top one. aria-hidden: the four
            rows above already carry every number it draws. */}
        {spark !== null && (
          <svg
            width={SPARK_W}
            height={SPARK_H}
            viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
            className={styles.spark}
          >
            <path d={spark.area} fill={color} opacity="0.14" />
            <path d={spark.line} stroke={color} strokeWidth="2" fill="none" />
          </svg>
        )}
      </SectionCard>
    </div>
  );
}
