import { cx } from "@/lib/cx.ts";
import { MoneyFigure } from "../MoneyFigure/index.tsx";
import { Facts } from "./components/Facts/index.tsx";
import { type HeroBandProps, useHeroBand } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  painel: "Painel",
  dashboard: "Dashboard",
  subtitle: "Onde o dinheiro da família está hoje e para onde ele vai.",
  tetoDesteMes: "Teto deste mês",
} as const;

// An explicit map, not `styles[tone]`: a CSS-Modules string lookup dies silently
// when a class is renamed, which is why StatCard and SectionCard write theirs out.
const TONE_CLASS = {
  positive: styles.positive,
  caution: styles.caution,
  negative: styles.negative,
} as const;

// The page's title block and its headline figure, in one band. It replaces
// PageHeader on this route only: the other five screens still render that
// component, which is why none of this copy moved into it.
//
// The headline is the ceiling and the line under it is the verdict — the one
// sentence the page never stated. Every card here already states its conclusion
// before its evidence; the page used to do the reverse.
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
            <h1 className={styles.title}>{COPY.dashboard}</h1>
            <p className={styles.subtitle}>{COPY.subtitle}</p>
          </div>

          {figures !== null && (
            // A <dl>, like Facts and Headline: the screen's biggest figure was
            // its only unlabelled one, two sibling <p>s with nothing tying the
            // caption to the number.
            <dl className={styles.figures}>
              <dt className={styles.eyebrow}>{COPY.tetoDesteMes}</dt>
              <dd className={styles.value}>
                <MoneyFigure cents={figures.value} />
              </dd>
              <dd className={styles.verdictRow}>
                <span
                  className={cx(
                    styles.verdict,
                    TONE_CLASS[figures.verdict.tone],
                  )}
                >
                  {figures.verdict.sentence}
                </span>
                {figures.verdict.limit !== null && (
                  <span className={styles.limit}>{figures.verdict.limit}</span>
                )}
              </dd>
            </dl>
          )}
        </div>

        {figures !== null && <Facts facts={figures.facts} />}
      </div>
    </section>
  );
}
