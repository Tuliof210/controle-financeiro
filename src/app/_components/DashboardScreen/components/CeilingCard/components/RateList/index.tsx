import { type RateListProps, useRateList } from "./hook.ts";
import styles from "./style.module.scss";

// The weekly and daily cadences under the card's headline. Split out of
// `CeilingCard/index.tsx` for the 100-line cap, which also retired the phantom
// `styles.rate` on the wrapper: `_split.scss` never defined that class, so the
// value was `undefined` and React dropped the attribute. The wrapper only ever
// had to be a flex item of the <dl>, and now it says so by having no class.
export function RateList(props: RateListProps) {
  const { rates } = useRateList(props);

  return (
    <dl className={styles.rates}>
      {rates.map((rate) => (
        <div key={rate.key}>
          <dt className={styles.rateLabel}>{rate.label}</dt>
          <dd className={styles.rateValue}>{rate.value}</dd>
        </div>
      ))}
    </dl>
  );
}
