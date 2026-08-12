import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { formatMoney, formatMoneyShort } from "@/lib/money.ts";
import { addMonths, formatYyyymm } from "@/lib/months.ts";
import type { BoardData } from "../Board/hook.ts";

export type HeroBandProps = { data?: BoardData };

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

// Pure: it calls no React hook, despite the `use` prefix the convention gives it.
//
// `figures` is null in every state but `ok`. The band's title half is static
// copy and renders while the payload is loading, missing or in error — only the
// numbers wait for it, which is why they are one nullable object rather than
// six independently nullable fields.
export function useHeroBand({ data }: HeroBandProps) {
  if (!data) return { figures: null };

  const { points, range } = data;
  const last = points[points.length - 1];
  // `current` can be missing when the payload and the clock disagree; falling
  // back to the first point keeps the card rendering instead of throwing on
  // `undefined.cumulative`.
  const current =
    points.find((point) => point.month === range.current) ?? points[0];

  return {
    figures: {
      endLabel: formatYyyymm(range.end),
      value: formatMoney(last.cumulative),
      now: formatMoney(current.cumulative),
      delta: formatMoney(last.cumulative - current.cumulative),
      // Drives the ▲/▼ glyph AND the badge tone, so the two can never disagree
      // — README rule 7: meaning is never colour-only.
      deltaUp: last.cumulative >= current.cumulative,
      facts: buildFacts(points),
    },
  };
}
