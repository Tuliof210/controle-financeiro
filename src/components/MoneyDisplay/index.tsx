import { type MoneyDisplayProps, useMoneyDisplay } from "./hook.ts";
import styles from "./style.module.scss";

export function MoneyDisplay(props: MoneyDisplayProps) {
  const { className, head, fraction, dim, label } = useMoneyDisplay(props);

  return (
    <span className={className} aria-label={label}>
      <span aria-hidden="true">
        {head}
        {fraction !== undefined && (
          <span className={dim ? styles.fraction : undefined}>{fraction}</span>
        )}
      </span>
    </span>
  );
}
