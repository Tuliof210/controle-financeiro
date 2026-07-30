import { Headline } from "../../../Headline";
import { type HeroProps, useHero } from "./hook";
import styles from "./style.module.scss";

// Two readings of the same quantity, side by side, so this month can be judged
// against the period instead of on its own. This month's figure leads, and has
// to: the ceiling spec reads the card's FIRST <dd> as it.
export function Hero(props: HeroProps) {
  const { monthly, splits, ratio, average, averageSplits, monthsLeft } =
    useHero(props);

  return (
    <div className={styles.hero}>
      <Headline caption="Gasto extra este mês">
        {monthly}
        <span className={styles.chip}>{ratio}</span>
        <span className={styles.splits}>{splits}</span>
      </Headline>
      <Headline caption="Média dos tetos">
        {average}
        <span className={styles.chip}>{monthsLeft}</span>
        <span className={styles.splits}>{averageSplits}</span>
      </Headline>
    </div>
  );
}
