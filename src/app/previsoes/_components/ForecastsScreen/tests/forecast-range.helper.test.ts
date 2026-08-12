import { describe, expect, it } from "@jest/globals";
import { formatMonths } from "@/app/previsoes/_components/ForecastsScreen/forecast-range.helper.ts";

describe("formatMonths", () => {
  it("names a single month rather than a range pointing at itself", () => {
    expect(formatMonths([202_605])).toBe("Mai/26");
  });

  it("renders a contiguous run as a range", () => {
    expect(formatMonths([202_601, 202_602, 202_603])).toBe("Jan/26–Mar/26");
  });

  it("joins non-contiguous runs with a middle dot", () => {
    expect(formatMonths([202_601, 202_602, 202_607])).toBe(
      "Jan/26–Fev/26 · Jul/26",
    );
  });

  it("renders nothing for a forecast with no active month", () => {
    expect(formatMonths([])).toBe("");
  });
});
