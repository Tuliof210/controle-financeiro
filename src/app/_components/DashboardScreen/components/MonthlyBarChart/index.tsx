import { ChartFrame } from "../ChartFrame";
import { type MonthlyBarChartProps, useMonthlyBarChart } from "./hook";

export function MonthlyBarChart(props: MonthlyBarChartProps) {
  const { frame, bars } = useMonthlyBarChart(props);

  return (
    <ChartFrame
      title="Entradas e saídas de cada mês do período"
      width={props.width}
      height={props.height}
      frame={frame}
    >
      {bars.map((bar) => (
        // 50% opacity marks a month whose commitment beat its actuals — a
        // projection, not history.
        <rect
          key={bar.key}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          fill={bar.fill}
          fillOpacity={bar.estimated ? 0.5 : 1}
        >
          <title>{bar.title}</title>
        </rect>
      ))}
    </ChartFrame>
  );
}
