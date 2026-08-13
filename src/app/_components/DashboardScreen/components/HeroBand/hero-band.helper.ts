import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { formatMoneyShort } from "@/lib/money.ts";
import { addMonths, formatYyyymm } from "@/lib/months.ts";

// Drives the glyph AND the badge tone, so the two can never disagree —
// src/styles/README.md rule 7: meaning is never colour-only.
function deltaGlyphFor(up: boolean): string {
  if (up) {
    return "▲";
  }
  return "▼";
}

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

function buildFacts(points: MonthPoint[]) {
  const months = points.length;
  const income = sum(points.map((point) => point.income));
  const expense = sum(points.map((point) => point.expense));
  const red = points.filter((point) => point.cumulative < 0).length;

  return [
    {
      key: "income",
      label: `ENTRADAS ${months}M`,
      value: formatMoneyShort(income),
      sub: `média ${formatMoneyShort(income / months)}/mês`,
    },
    {
      key: "expense",
      label: `SAÍDAS ${months}M`,
      value: formatMoneyShort(expense),
      sub: `média ${formatMoneyShort(expense / months)}/mês`,
    },
    {
      key: "red",
      label: "MESES NO VERMELHO",
      value: String(red),
      sub: redSub(points),
    },
  ];
}

export { buildFacts, deltaGlyphFor };
