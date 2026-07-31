import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChartColumn,
  Scale,
  TrendingUp,
} from "lucide-react";
import { HINTS } from "../../hints";
import { BalanceLineChart } from "../BalanceLineChart";
import { ChartCard } from "../ChartCard";
import { ChartLegend } from "../ChartLegend";
import { MonthlyBarChart } from "../MonthlyBarChart";
import { StatCard } from "../StatCard";
import { type OverviewProps, useOverview } from "./hook";
import styles from "./style.module.scss";

// The same two fills MonthlyBarChart's SERIES uses. Written out rather than
// imported from that hook: the legend belongs to the CARD, and importing a
// chart's internals into its container is what makes a chart hard to replace.
const BAR_LEGEND = [
  { key: "income", label: "Entradas", color: "var(--color-positive)" },
  { key: "expense", label: "Saídas", color: "var(--color-negative)" },
];

export function Overview(props: OverviewProps) {
  const { data, income, expense, balance } = useOverview(props);

  // A fragment, not a wrapper: Board is the one column, and a nested one here
  // would only be a second place for the card spacing to be decided.
  return (
    <>
      <div className={styles.kpis}>
        <StatCard
          title="Entradas"
          icon={ArrowDownCircle}
          tone="positive"
          hint={HINTS.income}
          stats={data.income}
          series={income}
        />
        <StatCard
          title="Saídas"
          icon={ArrowUpCircle}
          tone="negative"
          hint={HINTS.expense}
          stats={data.expense}
          series={expense}
        />
        <StatCard
          title="Saldo"
          icon={Scale}
          hint={HINTS.balance}
          stats={data.balance}
          series={balance}
          signed
        />
      </div>

      <ChartCard
        title="Evolução mensal"
        icon={ChartColumn}
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
        icon={TrendingUp}
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
