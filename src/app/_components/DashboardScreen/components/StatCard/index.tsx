import { Tooltip } from "@/components/Tooltip/index.tsx";
import { cx } from "@/lib/cx.ts";
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
//
// The aria-hidden sparkline that used to sit on the bottom edge is gone: no axis,
// no scale, no labels, restating the figures printed directly above it.
export function StatCard(props: StatCardProps) {
  const {
    title,
    icon: Icon,
    hint,
    chip,
    glyph,
    total,
    tone,
    rows,
  } = useStatCard(props);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <span className={cx(styles.chip, CHIP_CLASS[chip])}>
          <Icon size={16} aria-hidden={true} />
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

        {/* Two figures, not four: every rule on the grid is a cell border, so it
            is drawn by the cells themselves and never by a fill. */}
        <dl className={styles.rows}>
          {rows.map((row) => (
            <div className={styles.row} key={row.key}>
              <dt className={styles.label}>{row.label}</dt>
              <dd className={styles.value}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
