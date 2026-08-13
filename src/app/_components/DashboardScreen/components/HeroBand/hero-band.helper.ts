import type { DashboardRange, MonthPoint } from "@/app/api/dashboard/types.ts";
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

  // addMonths rather than the next point's month: when the whole range is red
  // there is no next point, and the month after the last red one still reads
  // correctly.
  return `todos antes de ${formatYyyymm(addMonths(lastRed.month, 1))}`;
}

// Labels are sentence case in the source and shouted by `text-transform` in the
// stylesheet: an all-caps string reaches a screen reader as an all-caps string,
// and some voices spell those letter by letter.
function buildFacts(points: MonthPoint[], range: DashboardRange) {
  const months = points.length;
  const income = sum(points.map((point) => point.income));
  const expense = sum(points.map((point) => point.expense));
  const red = points.filter((point) => point.cumulative < 0).length;
  const last = points.at(-1);

  return [
    {
      // Demoted from the band's headline, which is the ceiling now. A projection
      // 29 months out was the loudest figure on the page while the balance it
      // was 18x larger than sat beside it at 70% opacity.
      key: "projected",
      label: "Saldo projetado",
      value: formatMoneyShort(last?.cumulative ?? 0),
      sub: formatYyyymm(range.end),
    },
    {
      key: "income",
      label: `Entradas ${months}m`,
      value: formatMoneyShort(income),
      sub: `média ${formatMoneyShort(income / months)}/mês`,
    },
    {
      key: "expense",
      label: `Saídas ${months}m`,
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
