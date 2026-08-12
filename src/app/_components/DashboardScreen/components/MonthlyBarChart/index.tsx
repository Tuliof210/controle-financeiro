import { PROJECTED_BAND_FILL, projectedRuleProps } from "../../chart.config.ts";
import { ChartFrame } from "../ChartFrame/index.tsx";
import { ChartTag } from "../ChartTag/index.tsx";
import { useChartTooltip } from "../ChartTooltip/hook.ts";
import { ChartTooltip } from "../ChartTooltip/index.tsx";
import { type MonthlyBarChartProps, useMonthlyBarChart } from "./hook.ts";

export function MonthlyBarChart(props: MonthlyBarChartProps) {
  const { frame, bars, band, width, height } = useMonthlyBarChart(props);
  const { tooltip, showTooltip, hideTooltip } = useChartTooltip();

  return (
    <>
      <ChartFrame
        title="Entradas e saídas de cada mês do período"
        width={width}
        height={height}
        frame={frame}
        background={
          band === null ? null : (
            <>
              <rect
                x={band.x}
                y={0}
                width={band.width}
                height={frame.innerHeight}
                fill={PROJECTED_BAND_FILL}
              />
              <ChartTag
                x={band.x}
                y={0}
                label="PROJETADO"
                tone="muted"
                flip={false}
              />
            </>
          )
        }
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
        {/* Last, so it reads over the bars it separates — the band behind them
            is a wash and this rule is what actually marks the boundary. */}
        {band === null ? null : (
          <line
            x1={band.x}
            x2={band.x}
            y1={0}
            y2={frame.innerHeight}
            {...projectedRuleProps}
          />
        )}
      </ChartFrame>
      <ChartTooltip tooltip={tooltip} />
    </>
  );
}
