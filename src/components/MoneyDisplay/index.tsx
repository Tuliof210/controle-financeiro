import { type MoneyDisplayProps, useMoneyDisplay } from "./hook.ts";

export function MoneyDisplay(props: MoneyDisplayProps) {
  const { moneyProps, head, fraction, fractionClass } = useMoneyDisplay(props);

  return (
    <span {...moneyProps}>
      {head}
      {fraction !== undefined && (
        <span className={fractionClass}>{fraction}</span>
      )}
    </span>
  );
}
