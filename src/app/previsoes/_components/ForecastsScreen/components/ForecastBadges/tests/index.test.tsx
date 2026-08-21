import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { ForecastBadges } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastBadges/index.tsx";

describe("ForecastBadges", () => {
  it("renders the kind", () => {
    render(<ForecastBadges kind="fixed" simulated={false} />);

    expect(screen.getByText("Fixa")).toBeInTheDocument();
    expect(screen.queryByText("Simulado")).not.toBeInTheDocument();
  });

  it("renders simulated after the kind when the forecast is a what-if", () => {
    render(<ForecastBadges kind="commitment" simulated={true} />);

    expect(screen.getByText("Compromisso futuro")).toBeInTheDocument();
    expect(screen.getByText("Simulado")).toBeInTheDocument();
  });
});
