import * as React from "react";

/**
 * The single money primitive. Renders an integer of minor units (centavos) as
 * tabular pt-BR currency: 1099 → "R$ 10,99". Negative sign is the Unicode minus
 * (−, U+2212). In hero/large, decimals are dimmed (~0.45 opacity).
 *
 * @startingPoint section="Money" subtitle="hero / large / base / small / delta" viewport="700x200"
 */
export interface MoneyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Amount in minor units (centavos). R$ 1.250,90 = 125090. */
  value: number;
  /** ISO currency. Default "BRL". */
  currency?: "BRL" | "USD" | "EUR";
  /** Number formatting locale. Default "pt-BR". */
  locale?: string;
  /** Type scale. Default "base". */
  variant?: "hero" | "large" | "base" | "small" | "delta";
  /** Show "+" on positive values (sign is automatic for negatives). */
  showPositiveSign?: boolean;
  /** Color green/red by sign (use for deltas, not balances). */
  colorBySign?: boolean;
  /** Override the dimmed-decimals behavior of the variant. */
  dimDecimals?: boolean;
  /** Hide the currency symbol. */
  hideSymbol?: boolean;
  /** Hide the decimal part. */
  hideCents?: boolean;
  /** Explicit color (CSS value); ignored when colorBySign. */
  color?: string;
}

export declare function MoneyDisplay(props: MoneyDisplayProps): React.JSX.Element;
