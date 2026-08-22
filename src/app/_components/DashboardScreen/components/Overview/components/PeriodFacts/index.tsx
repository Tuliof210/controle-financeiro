import { Card } from "@/components/Card/index.tsx";
import { type PeriodFactsProps, usePeriodFacts } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  title: "No período",
} as const;

// A definition list inside one card — evidence for the hero figure, not a row
// of identical KPI tiles.
export function PeriodFacts(props: PeriodFactsProps) {
  const { facts } = usePeriodFacts(props);

  return (
    <Card as="section" variant="elevated" padding="lg" className={styles.card}>
      <h2 className={styles.title}>{COPY.title}</h2>
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
    </Card>
  );
}
