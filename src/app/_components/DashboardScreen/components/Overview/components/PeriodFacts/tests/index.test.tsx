import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { PeriodFacts } from "@/app/_components/DashboardScreen/components/Overview/components/PeriodFacts/index.tsx";

describe("PeriodFacts", () => {
  it("pairs each label with its figure and its sub-line", () => {
    render(
      <PeriodFacts
        facts={[
          {
            key: "income",
            label: "Entradas · 3 meses",
            value: "R$ 30",
            sub: "média R$ 10/mês",
          },
        ]}
      />,
    );

    expect(screen.getByText("Entradas · 3 meses")).toBeInTheDocument();
    expect(screen.getByText("média R$ 10/mês")).toBeInTheDocument();
  });
});
