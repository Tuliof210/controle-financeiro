import { LinePath } from "@visx/shape";
import { ChartFrame } from "../ChartFrame/index.tsx";
import { useChartTooltip } from "../ChartTooltip/hook.ts";
import { ChartTooltip } from "../ChartTooltip/index.tsx";
import { DotMark } from "./components/DotMark/index.tsx";
import { TightestMark } from "./components/TightestMark/index.tsx";
import { type BalanceLineChartProps, useBalanceLineChart } from "./hook.ts";

const LINE = { stroke: "var(--color-brand)", strokeWidth: 2 };

export function BalanceLineChart(props: BalanceLineChartProps) {
  const {
    frame,
    solid,
    dashed,
    x,
    y,
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
      >
        {/* Without this a negative balance reads as "a bit lower" rather than
            "underwater". Drawn only when the series actually crosses zero. */}
        {zeroY !== null && (
          <line
            x1={0}
            x2={frame.innerWidth}
            y1={zeroY}
            y2={zeroY}
            stroke="var(--color-text-muted)"
          />
        )}
        <LinePath data={solid} x={x} y={y} {...LINE} />
        {/* Shares its first point with the solid path, so the seam connects. */}
        <LinePath data={dashed} x={x} y={y} {...LINE} strokeDasharray="6 4" />
        {/* Drawn over the line and under the dots, so a dot on that month stays
            hittable. */}
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
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
          />
        ))}
      </ChartFrame>
      <ChartTooltip tooltip={tooltip} />
    </>
  );
}
