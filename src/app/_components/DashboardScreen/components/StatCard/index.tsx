import { Icon } from "@/components/Icon/index.tsx";
import { Tooltip } from "@/components/Tooltip/index.tsx";
import { cx } from "@/lib/cx.ts";
import { SPARK_H, SPARK_W } from "../../spark.helper.ts";
import { Headline } from "../Headline/index.tsx";
import { MoneyFigure } from "../MoneyFigure/index.tsx";
import { type StatCardProps, useStatCard } from "./hook.ts";
import styles from "./style.module.scss";

// An explicit map, not `styles[chip]`: a CSS-Modules string lookup dies silently
// when a class is renamed, and SectionCard's own band map is written out for the
// same reason.
const CHIP_CLASS = {
  positive: styles.chipPositive,
  negative: styles.chipNeutral,
  brand: styles.chipBrand,
} as const;

// The KPI tile draws its OWN shell rather than SectionCard's: the target's tile
// has no filled band at all — it leads with a 28px icon chip carrying the
// semantic pair — and SectionCard has no slot for one. Thirteen other call sites
// render that component unchanged, which is exactly why this one stopped.
export function StatCard(props: StatCardProps) {
  const { title, icon, hint, chip, glyph, total, tone, rows, spark, color } =
    useStatCard(props);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <span className={cx(styles.chip, CHIP_CLASS[chip])}>
          <Icon name={icon} size={16} />
        </span>
        <h2 className={styles.title}>{title}</h2>
        {/* Named after the card: the dashboard renders many of these, and a
            generic label would list them all identically to a screen reader. */}
        <Tooltip text={hint} label={`Como ${title} é calculado`} />
      </div>

      <div className={styles.body}>
        <Headline caption="Valor total no período" tone={tone}>
          {Boolean(glyph) && <span aria-hidden={true}>{glyph} </span>}
          <MoneyFigure cents={total} />
        </Headline>

        {/* The 2x2 quadrant: every rule on it is a cell border, so the grid is
            drawn by the cells themselves and never by a fill. */}
        <dl className={styles.rows}>
          {rows.map((row) => (
            <div className={styles.row} key={row.key}>
              <dt className={styles.label}>{row.label}</dt>
              <dd className={styles.value}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* `margin-top: auto` is what makes the strip sit on the card's bottom
          edge however tall the tile grows beside its neighbours. aria-hidden:
          the four rows above already carry every number it draws. */}
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
          {/* The target washes the area at 0.1; --opacity-data-wash is 0.14 and
              is the token this repo already spends on exactly this. A token
              VALUE is T1's scope, so the four hundredths stay. */}
          <path
            d={spark.area}
            fill={color}
            opacity="var(--opacity-data-wash)"
          />
          <path
            d={spark.line}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </section>
  );
}
