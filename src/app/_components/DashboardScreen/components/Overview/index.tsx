import { HINTS } from "../../hints.ts";
import { BalanceLineChart } from "../BalanceLineChart/index.tsx";
import { ChartCard } from "../ChartCard/index.tsx";
import { ChartLegend } from "../ChartLegend/index.tsx";
import { MonthlyBarChart } from "../MonthlyBarChart/index.tsx";
import { type OverviewProps, useOverview } from "./hook.ts";

const BAR_LEGEND = [
  { key: "income", label: "Entradas", color: "var(--color-positive)" },
  { key: "expense", label: "Saídas", color: "var(--color-text-secondary)" },
];

export function Overview(props: OverviewProps) {
  const { data } = useOverview(props);

  return (
    <>
      <ChartCard
        title="Evolução mensal"
        icon="chartColumn"
        hint={HINTS.bars}
        legend={<ChartLegend items={BAR_LEGEND} />}
      >
        {(size) => (
          <MonthlyBarChart
            points={data.points}
            dashedFrom={data.dashedFrom}
            {...size}
          />
        )}
      </ChartCard>

      <ChartCard
        title="Saldo acumulado"
        icon="trendingUp"
        hint={HINTS.cumulative}
        legend={
          <ChartLegend note="sólida = realizado · tracejada = projeção" />
        }
      >
        {(size) => (
          <BalanceLineChart
            points={data.points}
            dashedFrom={data.dashedFrom}
            tightest={data.ceiling.tightest}
            {...size}
          />
        )}
      </ChartCard>
    </>
  );
}
