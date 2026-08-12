import { LinePath } from "@visx/shape";
import { ChartFrame } from "../ChartFrame/index.tsx";
import { ChartTooltip } from "../ChartTooltip/index.tsx";
import { useChartTooltip } from "../ChartTooltip/hook.ts";
import { TightestMark } from "./components/TightestMark/index.tsx";
import { type BalanceLineChartProps, useBalanceLineChart } from "./hook.ts";

const LINE = { stroke: "var(--color-brand)", strokeWidth: 2 };
// The actual pointer target: bigger than the visible r=3 dot, so landing
// near a point is as reliable as landing exactly on its 6px face.
const HIT_RADIUS = 10;

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
        {/* Drawn over the line and under the dots, so a dot on that month stays
            hittable. */}
        {tightestMark === null ? null : (
          <TightestMark {...tightestMark} height={frame.innerHeight} />
        )}
        {dots.map((dot) => (
          <g key={dot.key}>
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={3}
              fill="var(--color-brand)"
              fillOpacity={dot.projected ? 0.5 : 1}
            />
            {/* Invisible hit target, not the <title> this replaces — a
                native title tooltip is slow to open and tied to the tiny
                visible dot. aria-label keeps the accessible name. */}
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={HIT_RADIUS}
              fill="transparent"
              aria-label={dot.title}
              onPointerEnter={(event) => showTooltip(event, dot.title)}
              onPointerMove={(event) => showTooltip(event, dot.title)}
              onPointerLeave={hideTooltip}
            />
          </g>
        ))}
      </ChartFrame>
      <ChartTooltip tooltip={tooltip} />
    </>
  );
}
