import "@testing-library/jest-dom/jest-globals";
import { beforeAll, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { ChartColumn } from "lucide-react";
import { ChartCard } from "@/app/_components/DashboardScreen/components/ChartCard/index.tsx";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {
      // Nothing to observe without layout.
    }
    disconnect() {
      // Nothing to release either.
    }
  } as unknown as typeof ResizeObserver;
});

const measured = (width: number, height: number) => {
  Element.prototype.getBoundingClientRect = () =>
    ({ width, height }) as DOMRect;
};

const PLOT = "plot";
const LEGEND = "legenda";

describe("ChartCard", () => {
  it("hands the measured box to the plot it wraps", () => {
    measured(884, 240);
    render(
      <ChartCard title="Evolução mensal" icon={ChartColumn} hint="x">
        {(size) => <p>{`${size.width}x${size.height}`}</p>}
      </ChartCard>,
    );

    expect(
      screen.getByRole("heading", { name: "Evolução mensal" }),
    ).toBeInTheDocument();
    expect(screen.getByText("884x240")).toBeInTheDocument();
  });

  it("draws no plot before the card has a box", () => {
    measured(0, 0);
    render(
      <ChartCard title="Evolução mensal" icon={ChartColumn} hint="x">
        {() => <p>{PLOT}</p>}
      </ChartCard>,
    );

    expect(screen.queryByText("plot")).not.toBeInTheDocument();
  });

  it("rides the legend in the header band", () => {
    measured(884, 240);
    render(
      <ChartCard
        title="Evolução mensal"
        icon={ChartColumn}
        hint="x"
        legend={<span>{LEGEND}</span>}
      >
        {() => null}
      </ChartCard>,
    );

    expect(screen.getByText("legenda")).toBeInTheDocument();
  });
});
