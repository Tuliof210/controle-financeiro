import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { formatMoneyShort } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import {
  axisProps,
  GRID_COLOR,
  MARGIN,
  TICK_LABEL_PROPS,
  Y_TICKS,
} from "../../chart.config";
import { type BalanceLineChartProps, useBalanceLineChart } from "./hook";
import styles from "./style.module.scss";

const LINE = { stroke: "var(--color-brand)", strokeWidth: 2 };

export function BalanceLineChart(props: BalanceLineChartProps) {
  const {
    solid,
    dashed,
    x,
    y,
    dots,
    innerHeight,
    zeroY,
    monthScale,
    valueScale,
    gridValues,
    tickValues,
  } = useBalanceLineChart(props);

  return (
    <svg className={styles.svg} width={props.width} height={props.height}>
      <title>Saldo acumulado de cada mês do período</title>
      <Group left={MARGIN.left} top={MARGIN.top}>
        {gridValues.map((value) => (
          <line
            key={value}
            x1={0}
            x2={monthScale.range()[1]}
            y1={valueScale(value)}
            y2={valueScale(value)}
            stroke={GRID_COLOR}
          />
        ))}
        {/* Without this a negative balance reads as "a bit lower" rather than
            "underwater". Drawn only when the series actually crosses zero. */}
        {zeroY === null ? null : (
          <line
            x1={0}
            x2={monthScale.range()[1]}
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
        <AxisLeft
          scale={valueScale}
          numTicks={Y_TICKS}
          tickFormat={(value) => formatMoneyShort(Number(value))}
          tickLabelProps={TICK_LABEL_PROPS}
          {...axisProps}
        />
        <AxisBottom
          top={innerHeight}
          scale={monthScale}
          tickValues={tickValues}
          tickFormat={(value) => formatYyyymm(Number(value))}
          tickLabelProps={TICK_LABEL_PROPS}
          {...axisProps}
        />
      </Group>
    </svg>
  );
}
