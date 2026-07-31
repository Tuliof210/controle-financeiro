import { Facts } from "./components/Facts";
import { type HeroBandProps, useHeroBand } from "./hook";
import styles from "./style.module.scss";

// The page's title block and its headline figure, in one band. It replaces
// PageHeader on this route only: the other five screens still render that
// component, which is why none of this copy moved into it.
export function HeroBand(props: HeroBandProps) {
  const { figures } = useHeroBand(props);

  return (
    <section className={styles.band}>
      <div className={styles.edge} aria-hidden />
      <div className={styles.scan} aria-hidden />

      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.titleCol}>
            <p className={styles.eyebrow}>
              <span className={styles.mark} aria-hidden />
              PAINEL
            </p>
            {/* An <h1>, and no <h3> anywhere in this band: goals.spec.ts finds a
                goal card as the only <section> on this page carrying one. */}
            <h1 className={styles.title}>
              Dashboard
              <span className={styles.cursor} aria-hidden />
            </h1>
            <p className={styles.subtitle}>
              Onde o dinheiro da família está hoje e para onde ele vai.
            </p>
          </div>

          {figures ? (
            <div className={styles.figures}>
              <p className={styles.eyebrow}>
                SALDO PROJETADO · {figures.endLabel}
              </p>
              <p className={styles.value}>{figures.value}</p>
              <div className={styles.deltaRow}>
                <span
                  className={`${styles.badge} ${figures.deltaUp ? styles.up : styles.down}`}
                >
                  <span aria-hidden>{figures.deltaUp ? "▲" : "▼"}</span>{" "}
                  {figures.delta}
                </span>
                <span className={styles.vs}>
                  vs. saldo atual de {figures.now}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {figures ? <Facts facts={figures.facts} /> : null}
      </div>
    </section>
  );
}
