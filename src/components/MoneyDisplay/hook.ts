import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx.ts";
import { formatMoney, splitMoney } from "@/lib/money.ts";
import styles from "./style.module.scss";

const DIM_BY_DEFAULT: Record<string, boolean> = {
  hero: true,
  large: true,
};
const TRAILING_COMMA = /,$/;

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
    head = head.replace(TRAILING_COMMA, "");
  }
  if (cents > 0 && showPositiveSign) {
    return `+${head}`;
  }
  return head;
}

function signClass(colorBySign: boolean, value: number): string | undefined {
  if (!colorBySign) {
    return;
  }
  if (value < 0) {
    return styles.negative;
  }
  return styles.positive;
}

function fractionOf(value: number, hideCents: boolean): string | undefined {
  if (hideCents) {
    return;
  }
  return splitMoney(value).fraction;
}

function fractionClassOf(dim: boolean): string | undefined {
  if (dim) {
    return styles.fraction;
  }
}

export type MoneyDisplayProps = {
  value: number;
  variant?: "hero" | "large" | "base" | "small" | "delta";
  showPositiveSign?: boolean;
  colorBySign?: boolean;
  dimDecimals?: boolean;
  hideSymbol?: boolean;
  hideCents?: boolean;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">;

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
        signClass(colorBySign, value),
        className,
      ),
      "aria-label": formatMoney(value),
      ...rest,
    },
    head: headOf(value, showPositiveSign, hideSymbol, hideCents),
    fraction: fractionOf(value, hideCents),
    fractionClass: fractionClassOf(dim),
  };
}
