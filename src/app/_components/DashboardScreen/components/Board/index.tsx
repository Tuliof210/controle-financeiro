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
import { MonthlyBarChart } from "../MonthlyBarChart";
import { StatCard } from "../StatCard";
import { type BoardProps, useBoard } from "./hook";
import styles from "./style.module.scss";

export function Board(props: BoardProps) {
  const { data } = useBoard(props);

  return (
    <div className={styles.grid}>
      <StatCard
        title="Entradas"
        icon={ArrowDownCircle}
        tone="positive"
        hint={HINTS.income}
        stats={data.income}
      />
      <StatCard
        title="Saídas"
        icon={ArrowUpCircle}
        tone="negative"
        hint={HINTS.expense}
        stats={data.expense}
      />
      <StatCard
        title="Saldo"
        icon={Scale}
        hint={HINTS.balance}
        stats={data.balance}
        signed
      />

      <div className={styles.wide}>
        <ChartCard title="Evolução mensal" icon={ChartColumn} hint={HINTS.bars}>
          {(size) => <MonthlyBarChart points={data.points} {...size} />}
        </ChartCard>
      </div>

      <div className={styles.wide}>
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
      </div>
    </div>
  );
}
