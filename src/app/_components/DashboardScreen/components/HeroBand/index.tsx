import { Delta } from "@/components/Delta/index.tsx";
import { MoneyDisplay } from "@/components/MoneyDisplay/index.tsx";
import { cx } from "@/lib/cx.ts";
import { type HeroBandProps, useHeroBand } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  dashboard: "Dashboard",
  lede: "Onde o dinheiro da família está hoje e para onde ele vai.",
  saldoProjetado: "Saldo projetado em",
  vsSaldoAtual: "vs. saldo atual de",
} as const;

// Editorial, not a metric tile: the page title, a lede, then the projected
// balance as type. Image-direction was skipped — `/ps-run` has no image gate.
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
              {COPY.saldoProjetado} {figures.endLabel}.
            </p>
            <p className={styles.value}>
              <MoneyDisplay value={figures.value} variant="hero" />
            </p>
            <p className={styles.deltaLine}>
              <Delta value={figures.delta} money={true} />
              <span className={styles.vs}>
                {COPY.vsSaldoAtual} {figures.now}.
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
