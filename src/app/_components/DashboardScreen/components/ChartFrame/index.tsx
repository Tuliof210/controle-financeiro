import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import {
  axisProps,
  GRID_COLOR,
  MARGIN,
  TICK_LABEL_PROPS,
  Y_TICKS,
} from "../../chart.config.ts";
import { type ChartFrameProps, useChartFrame } from "./hook.ts";
import styles from "./style.module.scss";

// Everything the two charts have in common: the Y axis pinned in its own
// <svg> outside the scroll box, and a second, scrollable <svg> holding the
// gridlines, the marks and the X axis — wide enough to fit every month at a
// fixed bandwidth, sized for one window (12 desktop / 6 mobile) to fill the
// card. Only the marks differ, so they come in as children rather than
// through a generic.
export function ChartFrame(props: ChartFrameProps) {
  const {
    title,
    height,
    frame,
    background,
    children,
    formatTick,
    formatMonthTick,
  } = useChartFrame(props);
  const {
    monthScale,
    valueScale,
    innerHeight,
    innerWidth,
    left,
    gridValues,
    tickValues,
  } = frame;

  return (
    <div className={styles.frame}>
      {/* Pinned: stays on screen while .scroll below scrolls horizontally.
          Decorative duplicate of information every mark's own <title> in
          .scroll already carries, so it is hidden from assistive tech rather
          than titled. */}
      <svg
        className={styles.axis}
        width={left}
        height={height}
        aria-hidden="true"
      >
        <Group left={left} top={MARGIN.top}>
          <AxisLeft
            scale={valueScale}
            numTicks={Y_TICKS}
            tickFormat={formatTick}
            tickLabelProps={TICK_LABEL_PROPS}
            {...axisProps}
          />
        </Group>
      </svg>
      {/* No tabIndex, no aria-label: the scrollable-region pattern needs nothing
          inside to be focusable, and every mark is now — so this left dead tab
          stops and a name duplicating the <svg>'s <title>. Unnamed, a <section>
          is no region, so the graphic is named once. */}
      <section className={styles.scroll}>
        <svg
          className={styles.plot}
          width={innerWidth + MARGIN.right}
          height={height}
        >
          <title>{title}</title>
          <Group top={MARGIN.top}>
            {/* First, so the gridlines and every mark stay drawn over it. */}
            {background}
            {gridValues.map((value) => (
              <line
                key={value}
                x1={0}
                x2={innerWidth}
                y1={valueScale(value)}
                y2={valueScale(value)}
                stroke={GRID_COLOR}
              />
            ))}
            {children}
            <AxisBottom
              top={innerHeight}
              scale={monthScale}
              tickValues={tickValues}
              tickFormat={formatMonthTick}
              tickLabelProps={TICK_LABEL_PROPS}
              {...axisProps}
            />
          </Group>
        </svg>
      </section>
    </div>
  );
}
