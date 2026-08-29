import { cx } from "@/lib/cx.ts";
import { type HeroBandProps, useHeroBand } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  dashboard: "Dashboard",
  lede: "Onde o dinheiro da família está hoje e para onde ele vai.",
} as const;

// Page title on this route. The projected balance is ProjectedBalance, a card
// on the board — this block is wayfinding, and it renders in every state so
// the page never opens on a bare notice.
export function HeroBand(props: HeroBandProps) {
  const { live } = useHeroBand(props);

  return (
    <section className={cx(styles.band, !live && styles.waiting)}>
      <h1 className={styles.title}>
        {COPY.dashboard}
        <span className={styles.cursor} aria-hidden={true} />
      </h1>
      <p className={styles.lede}>{COPY.lede}</p>
    </section>
  );
}
