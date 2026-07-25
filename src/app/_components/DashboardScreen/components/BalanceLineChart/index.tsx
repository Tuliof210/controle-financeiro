import { LinePath } from "@visx/shape";
import { ChartFrame } from "../ChartFrame";
import { type BalanceLineChartProps, useBalanceLineChart } from "./hook";

const LINE = { stroke: "var(--color-brand)", strokeWidth: 2 };

export function BalanceLineChart(props: BalanceLineChartProps) {
  const { frame, solid, dashed, x, y, dots, zeroY, width, height } =
    useBalanceLineChart(props);

  return (
    <ChartFrame
      title="Saldo acumulado de cada mês do período"
      width={width}
      height={height}
      frame={frame}
    >
      {/* Without this a negative balance reads as "a bit lower" rather than
          "underwater". Drawn only when the series actually crosses zero. */}
      {zeroY === null ? null : (
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
      {dots.map((dot) => (
        <circle
          key={dot.key}
          cx={dot.cx}
          cy={dot.cy}
          r={3}
          fill="var(--color-brand)"
          fillOpacity={dot.projected ? 0.5 : 1}
        >
          <title>{dot.title}</title>
        </circle>
      ))}
    </ChartFrame>
  );
}
