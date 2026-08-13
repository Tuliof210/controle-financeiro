import { splitMoney } from "@/lib/money.ts";

interface MoneyFigureProps {
  // Cents, not a formatted string: the split has to happen where the format is
  // known, or this component would be a second place that knows where the
  // decimal comma goes.
  cents: number;
}

// Calls no React hook, despite the `use` prefix the convention gives it.
export function useMoneyFigure({ cents }: MoneyFigureProps) {
  return splitMoney(cents);
}

export type { MoneyFigureProps };
