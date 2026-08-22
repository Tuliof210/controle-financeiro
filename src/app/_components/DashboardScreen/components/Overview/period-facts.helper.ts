import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { formatMoneyShort } from "@/lib/money.ts";
import { addMonths, formatYyyymm } from "@/lib/months.ts";

const sum = (values: number[]): number =>
  values.reduce((total, value) => total + value, 0);

// "todos antes de X" is only honest when every red month precedes every black
// one. The design's sample data happened to be contiguous; real data will not
// always be, and a scattered run gets the vaguer line instead.
function redSub(points: MonthPoint[]): string {
  const red = points.filter((point) => point.cumulative < 0);
  const lastRed = red.at(-1);
  if (!lastRed) {
    return "nenhum mês no vermelho";
  }

  const isPrefix = points.indexOf(lastRed) === red.length - 1;
  if (!isPrefix) {
    return "espalhados pelo período";
  }

  return `todos antes de ${formatYyyymm(addMonths(lastRed.month, 1))}`;
}

function monthLabel(months: number): string {
  if (months === 1) {
    return "1 mês";
  }
  return `${months} meses`;
}

function buildFacts(points: MonthPoint[]) {
  const months = points.length;
  const income = sum(points.map((point) => point.income));
  const expense = sum(points.map((point) => point.expense));
  const red = points.filter((point) => point.cumulative < 0).length;
  const span = monthLabel(months);

  return [
    {
      key: "income",
      label: `Entradas · ${span}`,
      value: formatMoneyShort(income),
      sub: `média ${formatMoneyShort(income / months)}/mês`,
    },
    {
      key: "expense",
      label: `Saídas · ${span}`,
      value: formatMoneyShort(expense),
      sub: `média ${formatMoneyShort(expense / months)}/mês`,
    },
    {
      key: "red",
      label: "Meses no vermelho",
      value: String(red),
      sub: redSub(points),
    },
  ];
}

export { buildFacts };
