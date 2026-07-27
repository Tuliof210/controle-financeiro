import { Check, Target } from "lucide-react";
import { type GoalCardProps, useGoalCard } from "./hook";
import styles from "./style.module.scss";

export function GoalCard(props: GoalCardProps) {
  const { name, percent, full, badge, covered, eta, note, srLabel } =
    useGoalCard(props);

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <div>
          <p className={styles.name}>
            {full ? (
              <Check size={15} aria-hidden className={styles.iconFull} />
            ) : (
              <Target size={15} aria-hidden className={styles.icon} />
            )}
            {name}
          </p>
          <p className={styles.eta}>{eta}</p>
        </div>
        <span className={`${styles.badge} ${full ? styles.badgeFull : ""}`}>
          {badge}
        </span>
      </div>
      <p className={styles.covered}>{covered}</p>
      <div className={styles.track} role="img" aria-label={srLabel}>
        <div
          className={`${styles.fill} ${full ? styles.fillFull : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className={styles.note}>{note}</p>
    </section>
  );
}
