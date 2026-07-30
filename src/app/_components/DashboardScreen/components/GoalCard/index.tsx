import { Target } from "lucide-react";
import { type GoalCardProps, useGoalCard } from "./hook";
import styles from "./style.module.scss";

export function GoalCard(props: GoalCardProps) {
  const { name, target, metrics } = useGoalCard(props);

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        {/* h3, under the banner's h2: every other card on this screen titles
            itself through SectionCard's h2, and without these the goals offered
            heading navigation nothing but the page h1. */}
        <h3 className={styles.name}>
          <Target size={16} aria-hidden className={styles.icon} />
          {name}
        </h3>
        <span className={styles.target}>{target}</span>
      </div>

      {/* Every figure here is words and numbers, never a colour or a length —
          so unlike the meter this replaces, none of it needs a second
          announcement for a screen reader. */}
      <dl className={styles.metrics}>
        {metrics.map((metric) => (
          <div key={metric.key} className={styles.metric}>
            <dt className={styles.label}>{metric.label}</dt>
            <dd className={styles.value}>{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
