import { Delta } from "@/components/Delta/index.tsx";
import { MoneyDisplay } from "@/components/MoneyDisplay/index.tsx";
import { cx } from "@/lib/cx.ts";
import { AnswerBar } from "./components/AnswerBar/index.tsx";
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
  const { figures, live } = useHeroBand(props);

  return (
    <>
      {/* BEFORE the band, not after it, and that order is load-bearing: a
          sticky element pins only once its own place in the flow reaches the
          offset. Sitting after a 336px band it stayed unpinned until ~364px of
          scroll, so a fully revealed bar floated loose over the page for 76px
          of it. From here its flow slot is the band's own first 64px — which it
          gives straight back with a negative margin — so it is pinned from
          almost the first pixel and can only ever appear where it belongs. */}
      {figures !== null && (
        <AnswerBar
          label={`${COPY.saldoProjetado} ${figures.endLabel}`}
          value={figures.value}
          delta={figures.delta}
        />
      )}

      {/* `waiting` when the figures on screen are not the current answer — no
          payload yet, or a request in flight replacing the one showing. It
          drives the caret and nothing else; see `_caret.scss`. */}
      <section className={cx(styles.band, !live && styles.waiting)}>
        <div className={styles.edge} aria-hidden={true} />
        <div className={styles.glow} aria-hidden={true} />

        <div className={styles.inner}>
          {/* Wayfinding, and nothing else: a thin chrome line across the top.
              The answer below it owns the band's primary slot. */}
          <div className={styles.titleRow}>
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
            <div className={styles.body}>
              <div className={styles.figures}>
                <p className={styles.eyebrow}>
                  {COPY.saldoProjetado} {figures.endLabel}
                </p>
                <p className={styles.value}>
                  <MoneyDisplay value={figures.value} variant="hero" />
                </p>
                <div className={styles.deltaRow}>
                  <span
                    className={cx(
                      styles.badge,
                      figures.deltaUp && styles.up,
                      !figures.deltaUp && styles.down,
                    )}
                  >
                    <Delta value={figures.delta} money={true} />
                  </span>
                  <span className={styles.vs}>
                    {COPY.vsSaldoAtual} {figures.now}
                  </span>
                </div>
              </div>

              <Facts facts={figures.facts} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
