import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { formatMoneyShort } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import {
  axisProps,
  GRID_COLOR,
  MARGIN,
  TICK_LABEL_PROPS,
  Y_TICKS,
} from "../../chart.config";
import { type MonthlyBarChartProps, useMonthlyBarChart } from "./hook";
import styles from "./style.module.scss";

export function MonthlyBarChart(props: MonthlyBarChartProps) {
  const { bars, monthScale, valueScale, innerHeight, gridValues, tickValues } =
    useMonthlyBarChart(props);

  return (
    <svg className={styles.svg} width={props.width} height={props.height}>
      <title>Entradas e saídas de cada mês do período</title>
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
        {bars.map((bar) => (
          // 50% opacity marks a month whose commitment beat its actuals — a
          // projection, not history.
          <rect
            key={bar.key}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={bar.fill}
            fillOpacity={bar.estimated ? 0.5 : 1}
          >
            <title>{bar.title}</title>
          </rect>
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
