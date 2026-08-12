import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Headline } from "@/app/_components/DashboardScreen/components/Headline/index.tsx";

describe("Headline", () => {
  it("pairs the caption with the figure", () => {
    render(<Headline caption="Valor total no período">R$ 10,00</Headline>);

    expect(screen.getByText("Valor total no período")).toBeInTheDocument();
    expect(screen.getByText("R$ 10,00")).toBeInTheDocument();
  });

  it("accents the figure when the card has a tone", () => {
    render(
      <Headline caption="Saldo" tone="negative">
        −R$ 1,00
      </Headline>,
    );

    expect(screen.getByText("−R$ 1,00")).toHaveClass("negative");
  });
});
