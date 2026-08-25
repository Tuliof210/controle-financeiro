import { LinePath } from "@visx/shape";
import {
  LINE_PROPS,
  PROJECTED_LINE_DASHARRAY,
  TETO_LINE_PROPS,
} from "../../../../chart-line.config.ts";
import { type PlotLinesProps, usePlotLines } from "./hook.ts";

export function PlotLines(props: PlotLinesProps) {
  const { teto, solid, dashed, x, y, xTeto, yTeto } = usePlotLines(props);

  return (
    <>
      {/* Under the current series so a zero-budget overlap still reads as atual. */}
      <LinePath data={teto} x={xTeto} y={yTeto} {...TETO_LINE_PROPS} />
      <LinePath data={solid} x={x} y={y} {...LINE_PROPS} />
      {/* Shares its first point with the solid path, so the seam connects. */}
      <LinePath
        data={dashed}
        x={x}
        y={y}
        {...LINE_PROPS}
        strokeDasharray={PROJECTED_LINE_DASHARRAY}
      />
    </>
  );
}
