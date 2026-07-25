import { describe, expect, it } from "vitest";
import type { SlackMonth } from "@/app/api/dashboard/types";
import { useSlackCard } from "./hook";

const month = (m: number, total: number): SlackMonth => ({
  month: m,
  total,
  weekly: Math.floor(total / 4),
  daily: Math.floor(total / 30),
});

describe("useSlackCard", () => {
  it("scales every bar against the roomiest month", () => {
    const { rows } = useSlackCard({
      slack: [month(202607, 500), month(202608, 1000)],
    });
    expect(rows.map((r) => r.percent)).toEqual([50, 100]);
  });

  it("goes empty when no month leaves any room at all", () => {
    // An all-underwater range: every total 0, so a list of flat bars would say
    // nothing a sentence does not say better.
    expect(useSlackCard({ slack: [month(202607, 0)] }).empty).toBe(true);
  });

  it("goes empty for an empty list without a NaN bar", () => {
    const { empty, rows } = useSlackCard({ slack: [] });
    expect(empty).toBe(true);
    expect(rows).toEqual([]);
  });

  it("is not empty as soon as one month has room", () => {
    expect(useSlackCard({ slack: [month(202607, 1)] }).empty).toBe(false);
  });

  it("formats the three figures and names the row for screen readers", () => {
    const { rows } = useSlackCard({ slack: [month(202607, 3040000)] });
    expect(rows[0]).toMatchObject({
      label: "Jul/26",
      total: "R$ 30.400,00",
      weekly: "R$ 7.600,00",
      daily: "R$ 1.013,33",
      srLabel: "Jul/26: R$ 30.400,00 seguros para gastar",
    });
  });
});
