import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";
import type { TooltipContent } from "../ChartTooltip/hook.ts";

interface Amounts {
  cumulative: number;
  ceilingLeft?: number;
}

function rowsFor(cumulative: number, ceilingLeft: number | undefined) {
  const cumulativeRow = {
    key: "cumulative",
    label: "acumulado",
    value: formatMoney(cumulative),
    tone: "brand" as const,
  };
  if (ceilingLeft === undefined) {
    return [cumulativeRow];
  }
  return [
    cumulativeRow,
    {
      key: "teto",
      label: "se gastar o teto",
      value: formatMoney(ceilingLeft),
      tone: "neutral" as const,
    },
  ];
}

function tipFor(
  month: number,
  plotX: number,
  tag: string,
  amounts: Amounts,
): TooltipContent {
  return {
    title: formatYyyymm(month),
    tag,
    plotX,
    rows: rowsFor(amounts.cumulative, amounts.ceilingLeft),
  };
}

export { tipFor };
