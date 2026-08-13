import { cx } from "@/lib/cx.ts";
import { MoneyFigure } from "../MoneyFigure/index.tsx";
import { Facts } from "./components/Facts/index.tsx";
import { type HeroBandProps, useHeroBand } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  painel: "PAINEL",
  dashboard: "Dashboard",
  subtitle: "Onde o dinheiro da família está hoje e para onde ele vai.",
  saldoProjetado: "SALDO PROJETADO ·",
  vsSaldoAtual: "vs. saldo atual de",
} as const;

// The page's title block and its headline figure, in one band. It replaces
// PageHeader on this route only: the other five screens still render that
// component, which is why none of this copy moved into it.
export function HeroBand(props: HeroBandProps) {
  const { figures } = useHeroBand(props);

  return (
    <section className={styles.band}>
      <div className={styles.edge} aria-hidden={true} />
      <div className={styles.glow} aria-hidden={true} />

      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.titleCol}>
            <p className={styles.eyebrow}>
              <span className={styles.mark} aria-hidden={true} />
              {COPY.painel}
            </p>
            {/* An <h1>: the page's only one, above the <h2> every card on this
                screen titles itself with. */}
            <h1 className={styles.title}>
              {COPY.dashboard}
              <span className={styles.cursor} aria-hidden={true} />
            </h1>
            <p className={styles.subtitle}>{COPY.subtitle}</p>
          </div>

          {figures !== null && (
            <div className={styles.figures}>
              <p className={styles.eyebrow}>
                {COPY.saldoProjetado} {figures.endLabel}
              </p>
              <p className={styles.value}>
                <MoneyFigure cents={figures.value} />
              </p>
              <div className={styles.deltaRow}>
                <span
                  className={cx(
                    styles.badge,
                    figures.deltaUp && styles.up,
                    !figures.deltaUp && styles.down,
                  )}
                >
                  <span aria-hidden={true}>{figures.deltaGlyph}</span>{" "}
                  {figures.delta}
                </span>
                <span className={styles.vs}>
                  {COPY.vsSaldoAtual} {figures.now}
                </span>
              </div>
            </div>
          )}
        </div>

        {figures !== null && <Facts facts={figures.facts} />}
      </div>
    </section>
  );
}
