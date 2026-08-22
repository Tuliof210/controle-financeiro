import { type MoneyDisplayProps, useMoneyDisplay } from "./hook.ts";
import styles from "./style.module.scss";

export function MoneyDisplay(props: MoneyDisplayProps) {
  const { moneyProps, head, fraction, dim } = useMoneyDisplay(props);

  return (
    <span {...moneyProps}>
      {head}
      {fraction !== undefined && (
        <span className={dim ? styles.fraction : undefined}>{fraction}</span>
      )}
    </span>
  );
}
