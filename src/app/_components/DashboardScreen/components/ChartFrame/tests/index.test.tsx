import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { buildFrame } from "@/app/_components/DashboardScreen/chart-frame.helper.ts";
import { ChartFrame } from "@/app/_components/DashboardScreen/components/ChartFrame/index.tsx";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const points = [
  { month: 202_608, income: 1000, expense: 400, cumulative: 600 },
  { month: 202_609, income: 900, expense: 300, cumulative: 1200 },
] as MonthPoint[];

const frame = buildFrame(points, [600, 1200], 884, 240);

describe("ChartFrame", () => {
  it("names the scrollable plot region after the chart", () => {
    render(
      <ChartFrame
        title="Saldo acumulado"
        width={884}
        height={240}
        frame={frame}
      >
        <circle />
      </ChartFrame>,
    );

    // Named ONCE, on the graphic. The scroll box used to carry the same string as
    // an aria-label AND take a tab stop, under a pattern that requires nothing
    // inside it to be focusable — no longer true now that every mark is.
    const titles = [...document.querySelectorAll("title")].map(
      (t) => t.textContent,
    );

    expect(titles).toEqual(["Saldo acumulado"]);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(document.querySelector("[tabindex]")).toBeNull();
  });

  it("draws the background under the marks", () => {
    const { container } = render(
      <ChartFrame
        title="Saldo"
        width={884}
        height={240}
        frame={frame}
        background={<rect data-testid="wash" />}
      >
        <circle data-testid="mark" />
      </ChartFrame>,
    );

    const svg = container.querySelector("svg.plot");
    const order = [...(svg?.querySelectorAll("[data-testid]") ?? [])].map((n) =>
      n.getAttribute("data-testid"),
    );

    expect(order).toEqual(["wash", "mark"]);
  });

  it("pins the y axis outside the scrolling box, hidden from a11y", () => {
    const { container } = render(
      <ChartFrame title="Saldo" width={884} height={240} frame={frame}>
        <circle />
      </ChartFrame>,
    );

    expect(container.querySelector("svg.axis")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
