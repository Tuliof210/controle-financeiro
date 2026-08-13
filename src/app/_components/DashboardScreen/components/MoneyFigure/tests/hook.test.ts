import { describe, expect, it } from "@jest/globals";
import { useMoneyFigure } from "@/app/_components/DashboardScreen/components/MoneyFigure/hook.ts";

describe("useMoneyFigure", () => {
  it("splits at the decimal comma, keeping the comma on the head", () => {
    expect(useMoneyFigure({ cents: 123_456 })).toEqual({
      head: "R$ 1.234,",
      fraction: "56",
    });
  });

  it("carries the sign into the head", () => {
    expect(useMoneyFigure({ cents: -64_000 }).head).toBe("−R$ 640,");
  });

  it("keeps a two-digit fraction under a real", () => {
    expect(useMoneyFigure({ cents: 5 })).toEqual({
      head: "R$ 0,",
      fraction: "05",
    });
  });
});
