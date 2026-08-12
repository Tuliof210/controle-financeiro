import { describe, expect, it } from "@jest/globals";
import {
  SPARK_H,
  SPARK_W,
  spark,
} from "@/app/_components/DashboardScreen/spark.helper.ts";

describe("spark", () => {
  it("draws no path at all for an empty series", () => {
    expect(spark([])).toBeNull();
  });

  it("moves to the first point and lines to the rest", () => {
    const path = spark([0, 10]);

    expect(path?.line.startsWith("M 0.0")).toBe(true);
    expect(path?.line).toContain("L");
  });

  it("spans the full box width", () => {
    const path = spark([0, 5, 10]);

    expect(path?.line).toContain(`${SPARK_W.toFixed(1)}`);
  });

  it("draws a flat line for an all-equal series rather than NaN", () => {
    const path = spark([7, 7, 7]);

    expect(path?.line).not.toContain("NaN");
  });

  it("draws a single value without dividing by zero", () => {
    expect(spark([7])?.line).toBe("M 0.0 27.0");
  });

  it("closes the area path down to the baseline", () => {
    const path = spark([0, 10]);

    expect(
      path?.area.endsWith(`L ${SPARK_W} ${SPARK_H} L 0 ${SPARK_H} Z`),
    ).toBe(true);
  });
});
