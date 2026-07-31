import { type FactsProps, useFacts } from "./hook";
import styles from "./style.module.scss";

// A <dl>, not three divs: each figure is a labelled value, and the label is what
// keeps the biggest number on the band from being the only one a screen reader
// announces with a name.
export function Facts(props: FactsProps) {
  const { facts } = useFacts(props);

  return (
    <dl className={styles.facts}>
      {facts.map((fact) => (
        <div className={styles.fact} key={fact.key}>
          <dt className={styles.label}>{fact.label}</dt>
          <dd className={styles.value}>
            {fact.value}
            <span className={styles.sub}>{fact.sub}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
