import { Delta } from "@/components/Delta/index.tsx";
import { MoneyDisplay } from "@/components/MoneyDisplay/index.tsx";
import { cx } from "@/lib/cx.ts";
import { type HeroBandProps, useHeroBand } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  dashboard: "Dashboard",
  lede: "Quanto ainda dá para gastar agora sem comprometer os meses seguintes.",
  tetoEm: "Teto em",
  porSemana: "por semana",
  saldoProjetado: "Saldo projetado em",
  vsSaldoAtual: "vs. saldo atual de",
} as const;

// Editorial, not a metric tile: the page title, a lede that asks how much is
// still spendable, then the monthly ceiling as the hero figure and the
// projected end-of-period balance as labelled evidence underneath.
export function HeroBand(props: HeroBandProps) {
  const { figures, live } = useHeroBand(props);

  return (
    <section className={cx(styles.band, !live && styles.waiting)}>
      <div className={styles.edge} aria-hidden={true} />
      <div className={styles.glow} aria-hidden={true} />

      <div className={styles.inner}>
        <h1 className={styles.title}>
          {COPY.dashboard}
          <span className={styles.cursor} aria-hidden={true} />
        </h1>
        <p className={styles.lede}>{COPY.lede}</p>

        {figures !== null && (
          <div className={styles.answer}>
            <p className={styles.claim}>
              {`${COPY.tetoEm} ${figures.monthLabel}.`}
            </p>
            <p className={styles.value}>
              <MoneyDisplay value={figures.monthly} variant="hero" />
            </p>
            <p className={styles.weekly}>
              {`${figures.weekly} ${COPY.porSemana}`}
            </p>
            <p className={styles.evidence}>
              <MoneyDisplay value={figures.projectedEnd} variant="large" />
              <span className={styles.vs}>
                {`${COPY.saldoProjetado} ${figures.endLabel}.`}
              </span>
              <Delta value={figures.delta} money={true} />
              <span className={styles.vs}>
                {`${COPY.vsSaldoAtual} ${figures.now}.`}
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
