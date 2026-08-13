import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";
import type {
  TooltipContent,
  TooltipTone,
} from "../ChartTooltip/chart-tooltip.types.ts";

// What the bubble prints for one month. Its own file rather than a block inside
// `bar-series.helper.ts`: that one answers questions about the BARS' geometry,
// this one is the text of a caption, and neither has room for the other under
// the 100-line cap.

// The word the bubble prints, and the only channel that still says which KIND of
// fact this is once the chart is read in greyscale. A month counts as estimated
// when either side of it is — the pair is read as one month's answer.
//
// Three outcomes, not two. "simulado" wins over "estimado": a what-if is a
// weaker claim than a committed forecast, so the weaker word has to be the one
// the reader sees. PRODUCT.md's invariant is that the three never read alike, and
// with ?simulation=all they did.
const tagFor = (point: MonthPoint): string => {
  if (point.simulated) {
    return "simulado";
  }
  if (point.incomeEstimated || point.expenseEstimated) {
    return "estimado";
  }
  return "real";
};

// A negative month is the one figure here that earns an accent; the other two
// are always positive magnitudes and stay neutral.
const netTone = (balance: number): TooltipTone => {
  if (balance < 0) {
    return "negative";
  }
  return "neutral";
};

// `balance` (income - expense) is already on the payload — this derives no
// figure the screen does not already hold.
function tipFor(point: MonthPoint): TooltipContent {
  return {
    title: formatYyyymm(point.month),
    tag: tagFor(point),
    rows: [
      {
        key: "income",
        label: "entradas",
        value: formatMoney(point.income),
        tone: "positive",
      },
      {
        key: "expense",
        label: "saídas",
        value: formatMoney(point.expense),
        tone: "neutral",
      },
      {
        key: "balance",
        label: "saldo do mês",
        value: formatMoney(point.balance),
        tone: netTone(point.balance),
      },
    ],
  };
}

export { tagFor, tipFor };
