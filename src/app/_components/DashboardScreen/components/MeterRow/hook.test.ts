import { describe, expect, it } from "vitest";
import { useMeterRow } from "./hook";

// useMeterRow calls no React hooks, so it runs under this repo's
// node-environment Vitest config with no jsdom and no new dependency.
const row = (percent: number) =>
  useMeterRow({
    label: "Fev/26",
    percent,
    tone: "negative",
    srLabel: "…",
    children: null,
  });

describe("useMeterRow", () => {
  it("fills proportionally inside the normal range", () => {
    expect(row(0).fill).toBe("0%");
    expect(row(58.02).fill).toBe("58.02%");
    expect(row(100).fill).toBe("100%");
  });

  it("clamps a fill past 100 so the bar cannot overflow its track", () => {
    // The card still prints "133%" next to it — only the bar is clamped.
    expect(row(133).fill).toBe("100%");
    expect(row(1000).fill).toBe("100%");
  });

  it("clamps a negative fill to zero rather than a negative width", () => {
    expect(row(-25).fill).toBe("0%");
  });
});
