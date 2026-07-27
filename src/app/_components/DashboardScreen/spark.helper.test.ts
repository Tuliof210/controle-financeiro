import { describe, expect, it } from "vitest";
import { SPARK_H, SPARK_W, spark } from "./spark.helper";

// "M 0.0 27.0 L 56.0 5.0" -> [[0, 27], [56, 5]]
const coords = (path: string): number[][] =>
  path
    .replace(/[MLZ]/g, "")
    .trim()
    .split(/\s+/)
    .map(Number)
    .reduce<number[][]>((pairs, value, index) => {
      if (index % 2 === 0) pairs.push([value]);
      else pairs[pairs.length - 1].push(value);
      return pairs;
    }, []);

describe("spark", () => {
  it("returns null for an empty series so the caller renders no <svg>", () => {
    expect(spark([])).toBeNull();
  });

  it("draws a rising series from the baseline up to the plot ceiling", () => {
    const path = spark([0, 100]);
    // Two points, one dx apart: the low value sits on the baseline (30 - 3),
    // the high one 22px above it (30 - 3 - (30 - 8)).
    expect(path?.line).toBe("M 0.0 27.0 L 112.0 5.0");
  });

  it("closes the area back to the bottom edge", () => {
    const path = spark([0, 100]);
    expect(path?.area).toBe(`${path?.line} L 112 30 L 0 30 Z`);
  });

  it("draws a flat line for a single value rather than dividing by zero", () => {
    const path = spark([4200]);
    expect(path?.line).toBe("M 0.0 27.0");
    expect(path?.line).not.toContain("NaN");
  });

  it("draws a flat line for an all-equal series", () => {
    const path = spark([50, 50, 50, 50]);
    expect(coords(path?.line ?? "").map(([, y]) => y)).toEqual([
      27, 27, 27, 27,
    ]);
    expect(path?.line).not.toContain("NaN");
  });

  it("spreads a two-point series across the full width", () => {
    const xs = coords(spark([3, 9])?.line ?? "").map(([x]) => x);
    expect(xs).toEqual([0, SPARK_W]);
  });

  it("keeps every coordinate inside the 112x30 box", () => {
    const values = [-9000, 12, 4500, 0, -30, 99999, 1];
    for (const [x, y] of coords(spark(values)?.line ?? "")) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(SPARK_W);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(SPARK_H);
    }
  });

  it("puts the minimum below the maximum on the y axis (SVG y grows down)", () => {
    const ys = coords(spark([10, 90, 50])?.line ?? "").map(([, y]) => y);
    expect(ys[0]).toBeGreaterThan(ys[2]);
    expect(ys[2]).toBeGreaterThan(ys[1]);
  });
});
