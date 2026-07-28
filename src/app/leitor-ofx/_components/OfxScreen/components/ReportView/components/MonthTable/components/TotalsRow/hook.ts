export type TotalsRowProps = {
  income: string;
  expense: string;
  balance: string;
  count: number;
  negative: boolean;
};

export function useTotalsRow(props: TotalsRowProps) {
  return props;
}
