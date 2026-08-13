import { AreaClosed, LinePath } from "@visx/shape";
import {
  areaWashProps,
  crosshairProps,
  LINE_PROPS,
  PROJECTED_LINE_DASHARRAY,
} from "../../chart-line.config.ts";
import { ChartFrame } from "../ChartFrame/index.tsx";
import { ChartTooltip } from "../ChartTooltip/index.tsx";
import { DotMark } from "./components/DotMark/index.tsx";
import { TightestMark } from "./components/TightestMark/index.tsx";
import { type BalanceLineChartProps, useBalanceLineChart } from "./hook.ts";

export function BalanceLineChart(props: BalanceLineChartProps) {
  const {
    frame,
    solid,
    dashed,
    curve,
    x,
    y,
    dots,
    zeroY,
    tightestMark,
    width,
    height,
    tooltip,
    showTooltip,
    hideTooltip,
  } = useBalanceLineChart(props);

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
        <LinePath data={solid} x={x} y={y} {...LINE_PROPS} />
        {/* Shares its first point with the solid path, so the seam connects. */}
        <LinePath
          data={dashed}
          x={x}
          y={y}
          {...LINE_PROPS}
          strokeDasharray={PROJECTED_LINE_DASHARRAY}
        />
        {/* Over the line, under the dots: that month's dot stays hittable. */}
        {tightestMark !== null && (
          <TightestMark {...tightestMark} height={frame.innerHeight} />
        )}
        {/* `key` destructured out rather than spread: the rest of the object IS
            the mark's props, and React warns when key arrives via a spread. */}
        {dots.map(({ key, ...dot }) => (
          <DotMark
            key={key}
            {...dot}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
          />
        ))}
      </ChartFrame>
      <ChartTooltip tooltip={tooltip} />
    </>
  );
}
