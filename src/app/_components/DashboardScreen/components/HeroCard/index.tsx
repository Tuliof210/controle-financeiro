import { type HeroCardProps, useHeroCard } from "./hook";
import styles from "./style.module.scss";

export function HeroCard(props: HeroCardProps) {
  const { endLabel, value, now, delta, deltaUp, facts } = useHeroCard(props);

  return (
    <section className={styles.hero}>
      <div className={styles.scan} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.headline}>
          <div className={styles.rule} aria-hidden />
          <p className={styles.eyebrow}>SALDO PROJETADO · {endLabel}</p>
          <p className={styles.value}>{value}</p>
          <div className={styles.deltaRow}>
            <span
              className={`${styles.badge} ${deltaUp ? styles.up : styles.down}`}
            >
              <span aria-hidden>{deltaUp ? "▲" : "▼"}</span> {delta}
            </span>
            <span className={styles.vs}>vs. saldo atual de {now}</span>
          </div>
        </div>

        <dl className={styles.facts}>
          {facts.map((fact) => (
            <div className={styles.fact} key={fact.key}>
              <dt className={styles.factLabel}>{fact.label}</dt>
              <dd className={styles.factValue}>
                {fact.value}
                <span className={styles.factSub}>{fact.sub}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
