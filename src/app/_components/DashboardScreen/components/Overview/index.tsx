import { HINTS } from "../../hints.ts";
import { BalanceLineChart } from "../BalanceLineChart/index.tsx";
import { ChartCard } from "../ChartCard/index.tsx";
import { ChartLegend } from "../ChartLegend/index.tsx";
import { MonthlyBarChart } from "../MonthlyBarChart/index.tsx";
import { PeriodFacts } from "./components/PeriodFacts/index.tsx";
import { type OverviewProps, useOverview } from "./hook.ts";

const BAR_LEGEND = [
  { key: "income", label: "Entradas", color: "var(--color-positive)" },
  { key: "expense", label: "Saídas", color: "var(--color-text-secondary)" },
];

const LINE_LEGEND = [
  { key: "current", label: "Atual", color: "var(--color-brand)" },
  {
    key: "teto",
    label: "Se gastar o teto",
    color: "var(--color-text-secondary)",
  },
];

export function Overview(props: OverviewProps) {
  const { data, facts, areas } = useOverview(props);

  return (
    <>
      <div className={areas.facts}>
        <PeriodFacts facts={facts} />
      </div>

      <div className={areas.bars}>
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
      </div>

      <div className={areas.line}>
        <ChartCard
          title="Saldo acumulado"
          icon="trendingUp"
          hint={HINTS.cumulative}
          legend={
            <ChartLegend
              items={LINE_LEGEND}
              note="sólida = realizado · tracejada = projeção"
            />
          }
        >
          {(size) => (
            <BalanceLineChart
              points={data.points}
              dashedFrom={data.dashedFrom}
              tightest={data.ceiling.tightest}
              ceilingMonths={data.ceiling.months}
              {...size}
            />
          )}
        </ChartCard>
      </div>
    </>
  );
}
