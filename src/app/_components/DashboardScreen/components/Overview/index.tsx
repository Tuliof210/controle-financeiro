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
import { HeroCard } from "../HeroCard";
import { MonthlyBarChart } from "../MonthlyBarChart";
import { StatCard } from "../StatCard";
import { type OverviewProps, useOverview } from "./hook";
import styles from "./style.module.scss";

export function Overview(props: OverviewProps) {
  const { data, income, expense, balance } = useOverview(props);

  // A fragment, not a wrapper: Board is the one column, and a nested one here
  // would only be a second place for the card spacing to be decided.
  return (
    <>
      <HeroCard data={data} />

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

      <ChartCard title="Evolução mensal" icon={ChartColumn} hint={HINTS.bars}>
        {(size) => <MonthlyBarChart points={data.points} {...size} />}
      </ChartCard>

      <ChartCard
        title="Saldo acumulado"
        icon={TrendingUp}
        hint={HINTS.cumulative}
      >
        {(size) => (
          <BalanceLineChart
            points={data.points}
            dashedFrom={data.dashedFrom}
            {...size}
          />
        )}
      </ChartCard>
    </>
  );
}
