import { AreaClosed } from "@visx/shape";
import { areaWashProps, crosshairProps } from "../../chart-line.config.ts";
import { ChartFrame } from "../ChartFrame/index.tsx";
import { useChartTooltip } from "../ChartTooltip/hook.ts";
import { ChartTooltip } from "../ChartTooltip/index.tsx";
import { DotMark } from "./components/DotMark/index.tsx";
import { PlotLines } from "./components/PlotLines/index.tsx";
import { TightestMark } from "./components/TightestMark/index.tsx";
import { type BalanceLineChartProps, useBalanceLineChart } from "./hook.ts";

export function BalanceLineChart(props: BalanceLineChartProps) {
  const {
    frame,
    solid,
    dashed,
    teto,
    curve,
    x,
    y,
    xTeto,
    yTeto,
    dots,
    zeroY,
    tightestMark,
    width,
    height,
  } = useBalanceLineChart(props);
  const { tooltip, showTooltip, hideTooltip } = useChartTooltip();

  return (
    <>
      <ChartFrame
        title="Saldo acumulado de cada mês do período"
        width={width}
        height={height}
        frame={frame}
        background={
          // Closed against the value scale, so an underwater stretch fills down
          // from zero rather than painting the whole column.
          <AreaClosed
            data={curve}
            x={x}
            y={y}
            yScale={frame.valueScale}
            {...areaWashProps}
          />
        }
      >
        {/* Without it a negative balance reads as "a bit lower", not
            "underwater". Only when the series actually crosses zero. */}
        {zeroY !== null && (
          <line
            x1={0}
            x2={frame.innerWidth}
            y1={zeroY}
            y2={zeroY}
            stroke="var(--color-text-muted)"
          />
        )}
        {/* Driven by the tooltip's own hover: the two cannot disagree. */}
        {tooltip?.plotX !== undefined && (
          <line
            x1={tooltip.plotX}
            x2={tooltip.plotX}
            y1={0}
            y2={frame.innerHeight}
            {...crosshairProps}
          />
        )}
        <PlotLines
          teto={teto}
          solid={solid}
          dashed={dashed}
          x={x}
          y={y}
          xTeto={xTeto}
          yTeto={yTeto}
        />
        {/* Over the line, under the dots: that month's dot stays hittable. */}
        {tightestMark !== null && (
          <TightestMark {...tightestMark} height={frame.innerHeight} />
        )}
        {dots.map((dot) => (
          <DotMark
            key={dot.key}
            cx={dot.cx}
            cy={dot.cy}
            title={dot.title}
            projected={dot.projected}
            stroke={dot.stroke}
            tip={dot.tip}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
          />
        ))}
      </ChartFrame>
      <ChartTooltip tooltip={tooltip} />
    </>
  );
}
