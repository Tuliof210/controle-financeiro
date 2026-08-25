import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react";
import { PlotLines } from "@/app/_components/DashboardScreen/components/BalanceLineChart/components/PlotLines/index.tsx";
import type { CeilingMonth } from "@/app/api/dashboard/ceiling.types.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const month = { month: 202_601 } as MonthPoint;
const teto = {
  month: 202_601,
  budget: 0,
  ceilingBalance: 0,
  ceilingLeft: 10,
} as CeilingMonth;
const origin = () => 0;

describe("PlotLines", () => {
  it("paints the teto path first, without a dash", () => {
    const { container } = render(
      <svg aria-hidden="true">
        <PlotLines
          teto={[teto]}
          solid={[month]}
          dashed={[]}
          x={origin}
          y={origin}
          xTeto={origin}
          yTeto={origin}
        />
      </svg>,
    );
    const paths = container.querySelectorAll("path");

    expect(paths[0]).toHaveAttribute("stroke", "var(--color-text-secondary)");
    expect(paths[0]).not.toHaveAttribute("stroke-dasharray");
    expect(paths[1]).toHaveAttribute("stroke", "var(--color-brand)");
  });
});
