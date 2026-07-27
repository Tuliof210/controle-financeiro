import type { MonthPoint } from "@/app/api/dashboard/types";
import { formatMoney, formatMoneyShort } from "@/lib/money";
import { addMonths, formatYyyymm } from "@/lib/months";
import type { BoardData } from "../Board/hook";

export type HeroCardProps = { data: BoardData };

const sum = (values: number[]): number =>
  values.reduce((total, value) => total + value, 0);

// "todos antes de X" is only honest when every red month precedes every black
// one. The design's sample data happened to be contiguous; real data will not
// always be, and a scattered run gets the vaguer line instead.
function redSub(points: MonthPoint[]): string {
  const red = points.filter((point) => point.cumulative < 0);
  if (red.length === 0) return "nenhum mês no vermelho";

  const lastRed = red[red.length - 1];
  const isPrefix = points.indexOf(lastRed) === red.length - 1;
  if (!isPrefix) return "espalhados pelo período";

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

// Pure: it calls no React hook, which is why it carries hook.test.ts. The
// no-jsdom limit blocks RENDERING, not a hook that happens to use no React.
export function useHeroCard({ data }: HeroCardProps) {
  const { points, range } = data;
  const last = points[points.length - 1];
  // `current` can be missing when the payload and the clock disagree; falling
  // back to the first point keeps the card rendering instead of throwing on
  // `undefined.cumulative`.
  const current =
    points.find((point) => point.month === range.current) ?? points[0];

  return {
    endLabel: formatYyyymm(range.end),
    value: formatMoney(last.cumulative),
    now: formatMoney(current.cumulative),
    delta: formatMoney(last.cumulative - current.cumulative),
    // Drives the ▲/▼ glyph AND the badge tone, so the two can never disagree —
    // README rule 7: meaning is never colour-only.
    deltaUp: last.cumulative >= current.cumulative,
    facts: buildFacts(points),
  };
}
