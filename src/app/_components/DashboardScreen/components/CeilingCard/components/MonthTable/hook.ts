// One month, every figure already a formatted string: the arithmetic belongs to
// the payload and the formatting to CeilingCard's hook.
export type MonthRow = {
  key: number;
  label: string;
  isCurrent: boolean;
  balance: string; // the balance arriving at the month
  spend: string; // this month's ceiling
  left: string; // what is left once it has been spent
};

export type MonthTableProps = { rows: MonthRow[] };

export function useMonthTable(props: MonthTableProps) {
  return props;
}
