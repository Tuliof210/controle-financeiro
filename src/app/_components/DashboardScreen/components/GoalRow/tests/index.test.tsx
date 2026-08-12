import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { GoalRow } from "@/app/_components/DashboardScreen/components/GoalRow/index.tsx";
import type { GoalProjection } from "@/app/api/dashboard/types.ts";

const goal = (over: Partial<GoalProjection> = {}): GoalProjection => ({
  id: "g1",
  name: "Casa",
  targetCents: 150_000,
  dedicated: { months: 3, doneMonth: 202_603 },
  parallel: { months: 6, doneMonth: 202_606 },
  serialized: { months: 12, doneMonth: 202_612 },
  ...over,
});

const inList = (element: React.ReactElement) => render(<ul>{element}</ul>);

describe("GoalRow", () => {
  it("names the goal, its target and its three landings", () => {
    inList(<GoalRow goal={goal()} horizon={12} />);

    expect(screen.getByText("Casa")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.500")).toBeInTheDocument();
    expect(screen.getByText("~3 meses · Mar/2026")).toBeInTheDocument();
  });

  it("labels each funding assumption", () => {
    inList(<GoalRow goal={goal()} horizon={12} />);

    for (const label of ["DEDICADO", "EM PARALELO", "UM DE CADA VEZ"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("draws no bar for a metric with no rate behind it", () => {
    const { container } = inList(
      <GoalRow goal={goal({ dedicated: null })} horizon={12} />,
    );

    expect(screen.getByText("ritmo zero")).toBeInTheDocument();
    expect(container.querySelectorAll(".track")).toHaveLength(2);
  });
});
