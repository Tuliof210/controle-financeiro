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
import { type ChartFrameProps, useChartFrame } from "./hook";
import styles from "./style.module.scss";

// Everything the two charts have in common: the sized <svg>, its accessible
// name, the gridlines behind the marks and both axes in front. Only the marks
// differ, so they come in as children rather than through a generic.
export function ChartFrame(props: ChartFrameProps) {
  const { title, width, height, frame, children } = useChartFrame(props);
  const { monthScale, valueScale, innerHeight, left, gridValues, tickValues } =
    frame;

  return (
    <svg className={styles.svg} width={width} height={height}>
      <title>{title}</title>
      <Group left={left} top={MARGIN.top}>
        {gridValues.map((value) => (
          <line
            key={value}
            x1={0}
            x2={frame.innerWidth}
            y1={valueScale(value)}
            y2={valueScale(value)}
            stroke={GRID_COLOR}
          />
        ))}
        {children}
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
