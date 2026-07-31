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

      {/* The bar restates the months already written beside it, so it is the
          only part here that says nothing on its own and needs no second
          announcement. It is a plain <div>, never a <dt> or a <dd>: goals.spec
          reads the labels and values as paired lists. */}
      <dl className={styles.metrics}>
        {metrics.map((metric) => (
          <div key={metric.key} className={styles.metric}>
            <dt className={styles.label}>{metric.label}</dt>
            <dd className={styles.value}>{metric.value}</dd>
            {metric.bar ? (
              <div className={styles.track} aria-hidden>
                <div
                  className={styles.fill}
                  style={{
                    width: metric.bar.width,
                    background: metric.bar.color,
                  }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}
