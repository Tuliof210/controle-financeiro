import {
  PROJECTED_BAND_FILL,
  projectedRuleProps,
} from "../../chart-marks.config.ts";
import { ChartFrame } from "../ChartFrame/index.tsx";
import { ChartTag } from "../ChartTag/index.tsx";
import { ChartTooltip } from "../ChartTooltip/index.tsx";
import { BarMark } from "./components/BarMark/index.tsx";
import { type MonthlyBarChartProps, useMonthlyBarChart } from "./hook.ts";

export function MonthlyBarChart(props: MonthlyBarChartProps) {
  const {
    frame,
    bars,
    band,
    width,
    height,
    tooltip,
    showTooltip,
    hideTooltip,
  } = useMonthlyBarChart(props);

  return (
    <>
      <ChartFrame
        title="Entradas e saídas de cada mês do período"
        width={width}
        height={height}
        frame={frame}
        background={
          band !== null && (
            <>
              <rect
                x={band.x}
                y={0}
                width={band.width}
                height={frame.innerHeight}
                fill={PROJECTED_BAND_FILL}
              />
              {/* `PROJETADO` is ~97px. When only the last month or two is
                  projected there is about one band of room right of `band.x`,
                  and the tag used to be clipped mid-word by the SVG root. It
                  places itself against the plot width now. */}
              <ChartTag
                x={band.x}
                y={0}
                label="PROJETADO"
                tone="muted"
                plotWidth={frame.innerWidth}
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
            tip={bar.tip}
            plotHeight={frame.innerHeight}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
          />
        ))}
        {/* Last, so it reads over the bars it separates — the band behind them
            is a wash and this rule is what actually marks the boundary. */}
        {band !== null && (
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
