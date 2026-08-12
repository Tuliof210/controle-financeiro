import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react";
import { CoverageBar } from "@/app/previsoes/_components/ForecastsScreen/components/CoverageBar/index.tsx";

const period = { start: 202_601, end: 202_604 };

describe("CoverageBar", () => {
  it("draws one fill per contiguous run, hidden from the a11y tree", () => {
    const { container } = render(
      <CoverageBar months={[202_601, 202_604]} period={period} />,
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("span > span")).toHaveLength(2);
  });

  it("draws an empty track when nothing overlaps", () => {
    const { container } = render(
      <CoverageBar months={[202_712]} period={period} />,
    );

    expect(container.querySelectorAll("span > span")).toHaveLength(0);
  });
});
