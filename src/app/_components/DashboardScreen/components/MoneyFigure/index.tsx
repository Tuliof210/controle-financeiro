import { type MoneyFigureProps, useMoneyFigure } from "./hook.ts";
import styles from "./style.module.scss";

// A money figure whose cents are dimmed — the target's hero and large money
// variants. Every other figure on the screen keeps formatMoney's plain string:
// the dimming is what marks a number as one of the four the reader is meant to
// land on first, so spending it everywhere would spend it nowhere.
//
// A fragment, not a wrapper: it is dropped inside a <dd>, an <h1> or a <p> that
// already owns the size, the weight and the tabular figures, and a box here
// would only be a second place for those to be decided.
export function MoneyFigure(props: MoneyFigureProps) {
  const { head, fraction } = useMoneyFigure(props);

  // Two text nodes with no separator, so a screen reader still announces one
  // uninterrupted "R$ 1.234,56" and a copy/paste still yields one figure.
  return (
    <>
      {head}
      <span className={styles.fraction}>{fraction}</span>
    </>
  );
}
