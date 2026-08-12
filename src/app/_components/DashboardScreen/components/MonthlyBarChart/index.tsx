import {
  PROJECTED_BAND_FILL,
  projectedRuleProps,
} from "../../chart-marks.config.ts";
import { ChartFrame } from "../ChartFrame/index.tsx";
import { ChartTag } from "../ChartTag/index.tsx";
import { useChartTooltip } from "../ChartTooltip/hook.ts";
import { ChartTooltip } from "../ChartTooltip/index.tsx";
import { BarMark } from "./components/BarMark/index.tsx";
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
          <BarMark
            key={bar.key}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={bar.fill}
            estimated={bar.estimated}
            title={bar.title}
            plotHeight={frame.innerHeight}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
          />
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
