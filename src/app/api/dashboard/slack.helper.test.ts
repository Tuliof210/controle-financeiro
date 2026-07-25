import { describe, expect, it } from "vitest";
import { point } from "./fixtures.helper";
import { buildSlack, savingPace } from "./slack.helper";

describe("buildSlack", () => {
  it("takes 80% of the smallest cumulative from each month onward", () => {
    // cumulative 1000 / 2000 / 3000 -> suffix minima 1000 / 2000 / 3000
    const points = [1000, 2000, 3000].map((c, i) =>
      point(202601 + i, { cumulative: c }),
    );
    expect(buildSlack(points, 202601).map((m) => m.total)).toEqual([
      800, 1600, 2400,
    ]);
  });

  it("caps the months before a dip by the dip, and not the ones after it", () => {
    // cumulative 5000 / 1000 / 9000 -> suffix minima 1000 / 1000 / 9000
    const points = [5000, 1000, 9000].map((c, i) =>
      point(202601 + i, { cumulative: c }),
    );
    expect(buildSlack(points, 202601).map((m) => m.total)).toEqual([
      800, 800, 7200,
    ]);
  });

  it("never goes negative when the projection is underwater", () => {
    const points = [-500, -9000].map((c, i) =>
      point(202601 + i, { cumulative: c }),
    );
    expect(buildSlack(points, 202601)).toEqual([
      { month: 202601, total: 0, weekly: 0, daily: 0 },
      { month: 202602, total: 0, weekly: 0, daily: 0 },
    ]);
  });

  it("starts the list at the current month, not the range start", () => {
    const points = [1000, 2000, 3000].map((c, i) =>
      point(202601 + i, { cumulative: c }),
    );
    expect(buildSlack(points, 202602).map((m) => m.month)).toEqual([
      202602, 202603,
    ]);
  });

  it("does not let a dip behind the current month constrain the ceiling", () => {
    // The dip at 202601 is already spent history; the suffix minimum starts at
    // the month being listed, so it must not drag 202602's allowance down.
    const points = [10, 4000, 5000].map((c, i) =>
      point(202601 + i, { cumulative: c }),
    );
    expect(buildSlack(points, 202602).map((m) => m.total)).toEqual([
      3200, 4000,
    ]);
  });

  it("returns a single entry when the current month is the range end", () => {
    const points = [1000, 2000].map((c, i) =>
      point(202601 + i, { cumulative: c }),
    );
    expect(buildSlack(points, 202602)).toEqual([
      { month: 202602, total: 1600, weekly: 400, daily: 53 },
    ]);
  });

  it("floors the weekly and daily splits rather than rounding them", () => {
    // 80% of 1259 = 1007.2 -> 1007; /4 = 251.75 -> 251; /30 = 33.5 -> 33
    const points = [point(202601, { cumulative: 1259 })];
    expect(buildSlack(points, 202601)).toEqual([
      { month: 202601, total: 1007, weekly: 251, daily: 33 },
    ]);
  });
});

describe("savingPace", () => {
  it("is a quarter of the tightest month in the list", () => {
    const slack = [
      { month: 202601, total: 4000, weekly: 1000, daily: 133 },
      { month: 202602, total: 9000, weekly: 2250, daily: 300 },
    ];
    expect(savingPace(slack)).toBe(1000);
  });

  it("floors rather than rounding", () => {
    expect(savingPace([{ month: 1, total: 999, weekly: 0, daily: 0 }])).toBe(
      249,
    );
  });

  it("is zero for an empty list instead of dividing by nothing", () => {
    expect(savingPace([])).toBe(0);
  });
});
