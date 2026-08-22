import type { HTMLAttributes } from "react";
import { formatMoney, splitMoney } from "@/lib/money.ts";
import { cx } from "@/lib/cx.ts";
import styles from "./style.module.scss";

export type MoneyDisplayProps = {
  value: number;
  variant?: "hero" | "large" | "base" | "small" | "delta";
  showPositiveSign?: boolean;
  colorBySign?: boolean;
  dimDecimals?: boolean;
  hideSymbol?: boolean;
  hideCents?: boolean;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">;

const DIM_BY_DEFAULT: Record<string, boolean> = {
  hero: true,
  large: true,
};

function headOf(
  cents: number,
  showPositiveSign: boolean,
  hideSymbol: boolean,
  hideCents: boolean,
): string {
  let { head } = splitMoney(cents);
  if (hideSymbol) {
    head = head.replace("R$ ", "");
  }
  if (hideCents) {
    head = head.replace(/,$/, "");
  }
  if (cents > 0 && showPositiveSign) {
    return `+${head}`;
  }
  return head;
}

export function useMoneyDisplay({
  value,
  variant = "base",
  showPositiveSign = false,
  colorBySign = false,
  dimDecimals,
  hideSymbol = false,
  hideCents = false,
  className,
  ...rest
}: MoneyDisplayProps) {
  const dim = dimDecimals ?? Boolean(DIM_BY_DEFAULT[variant]);

  return {
    moneyProps: {
      className: cx(
        styles.money,
        styles[variant],
        colorBySign && (value < 0 ? styles.negative : styles.positive),
        className,
      ),
      "aria-label": formatMoney(value),
      ...rest,
    },
    head: headOf(value, showPositiveSign, hideSymbol, hideCents),
    fraction: hideCents ? undefined : splitMoney(value).fraction,
    dim,
  };
}
