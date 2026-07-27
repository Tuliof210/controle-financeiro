import { describe, expect, it } from "vitest";
import type { BoardData } from "../Board/hook";
import { useProjectionTab } from "./hook";

const slack = [{ month: 202607, total: 100, weekly: 25, daily: 3 }];
const limit = {
  goalCents: 300000,
  months: [{ month: 202607, spent: 400000, percent: 133 }],
};

const data = {
  range: { start: 202601, end: 202612, current: 202607 },
  slack,
  limit,
} as unknown as BoardData;

describe("useProjectionTab", () => {
  it("hands both cards their own slice of the payload", () => {
    const tab = useProjectionTab({ data });
    // Same references, not copies: nothing is recomputed per tab switch.
    expect(tab.slack).toBe(slack);
    expect(tab.limit).toBe(limit);
  });

  it("passes the range's CURRENT month down, not its start or end", () => {
    // The whole projected/realised split hangs on this one number; picking
    // `start` would hatch every month and `end` would hatch none.
    expect(useProjectionTab({ data }).current).toBe(202607);
  });
});
