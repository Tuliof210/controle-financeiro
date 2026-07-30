import { ChartFrame } from "../ChartFrame";
import { ChartTooltip } from "../ChartTooltip";
import { useChartTooltip } from "../ChartTooltip/hook";
import { type MonthlyBarChartProps, useMonthlyBarChart } from "./hook";

export function MonthlyBarChart(props: MonthlyBarChartProps) {
  const { frame, bars, width, height } = useMonthlyBarChart(props);
  const { tooltip, showTooltip, hideTooltip } = useChartTooltip();

  return (
    <>
      <ChartFrame
        title="Entradas e saídas de cada mês do período"
        width={width}
        height={height}
        frame={frame}
      >
        {bars.map((bar) => (
          <g key={bar.key}>
            {/* 50% opacity marks a month whose commitment beat its actuals —
                a projection, not history. */}
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={bar.fill}
              fillOpacity={bar.estimated ? 0.5 : 1}
            />
            {/* Invisible, full-column hit target, not the <title> this
                replaces — a near-zero bar can be a sliver a few pixels tall,
                and a native title tooltip is slow to open besides.
                aria-label keeps the accessible name. */}
            <rect
              x={bar.x}
              y={0}
              width={bar.width}
              height={frame.innerHeight}
              fill="transparent"
              aria-label={bar.title}
              onPointerEnter={(event) => showTooltip(event, bar.title)}
              onPointerMove={(event) => showTooltip(event, bar.title)}
              onPointerLeave={hideTooltip}
            />
          </g>
        ))}
      </ChartFrame>
      <ChartTooltip tooltip={tooltip} />
    </>
  );
}
