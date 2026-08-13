import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChartColumn,
  Scale,
  TrendingUp,
} from "lucide-react";
import { HINTS } from "../../hints.ts";
import { BalanceLineChart } from "../BalanceLineChart/index.tsx";
import { ChartCard } from "../ChartCard/index.tsx";
import { ChartLegend } from "../ChartLegend/index.tsx";
import { MonthlyBarChart } from "../MonthlyBarChart/index.tsx";
import { StatCard } from "../StatCard/index.tsx";
import { type OverviewProps, useOverview } from "./hook.ts";
import styles from "./style.module.scss";

// The same two fills MonthlyBarChart's SERIES uses. Written out rather than
// imported from that hook: the legend belongs to the CARD, and importing a
// chart's internals into its container is what makes a chart hard to replace.
const BAR_LEGEND = [
  { key: "income", label: "Entradas", color: "var(--cat-green)" },
  { key: "expense", label: "Saídas", color: "var(--cat-amber)" },
];

export function Overview(props: OverviewProps) {
  const { data } = useOverview(props);

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
        />
        {/* No `tone`. It used to pass "negative", which painted the period's
            total outflow — the card's largest element — in --color-negative. The
            constitution's first pillar is that a normal expense is not red, and
            `_chip.scss` applies exactly that rule ten lines away on a 28px icon
            chip while the 24px money figure beside it broke it. formatMoney's
            sign already carries the meaning, as the quadrant rows rely on. */}
        <StatCard
          title="Saídas"
          icon={ArrowUpCircle}
          chip="negative"
          hint={HINTS.expense}
          stats={data.expense}
        />
        <StatCard
          title="Saldo"
          icon={Scale}
          hint={HINTS.balance}
          stats={data.balance}
          signed={true}
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
