import { type ChartLegendProps, useChartLegend } from "./hook.ts";
import styles from "./style.module.scss";

// Rides a chart card's header band. Not aria-hidden: it is the only place the
// colour-to-series mapping is written down, and the marks inside the plot name
// their series in words but not their fill.
export function ChartLegend(props: ChartLegendProps) {
  const { items, note } = useChartLegend(props);

  return (
    <p className={styles.legend}>
      {items.map((item) => (
        <span className={styles.item} key={item.key}>
          <span
            className={styles.swatch}
            style={{ background: item.color }}
            aria-hidden={true}
          />
          {item.label}
        </span>
      ))}
      {Boolean(note) && <span className={styles.note}>{note}</span>}
    </p>
  );
}
