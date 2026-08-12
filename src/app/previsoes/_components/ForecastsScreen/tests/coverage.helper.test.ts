import { describe, expect, it } from "@jest/globals";
import { coverage } from "@/app/previsoes/_components/ForecastsScreen/coverage.helper.ts";

const period = { start: 202_601, end: 202_604 };

describe("coverage", () => {
  it("positions a run as a percentage of the whole range", () => {
    expect(coverage([202_602, 202_603], period)).toEqual([
      { left: "25%", width: "50%" },
    ]);
  });

  it("draws one segment per contiguous run, not one span end to end", () => {
    expect(coverage([202_601, 202_604], period)).toEqual([
      { left: "0%", width: "25%" },
      { left: "75%", width: "25%" },
    ]);
  });

  it("drops months outside the range instead of overflowing the track", () => {
    expect(coverage([202_512, 202_601, 202_705], period)).toEqual([
      { left: "0%", width: "25%" },
    ]);
  });

  it("draws an empty track when nothing overlaps", () => {
    expect(coverage([202_705], period)).toEqual([]);
  });

  it("draws nothing for an inverted range", () => {
    expect(coverage([202_602], { start: 202_604, end: 202_601 })).toEqual([]);
  });
});
