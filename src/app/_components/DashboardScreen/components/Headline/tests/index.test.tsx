import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Headline } from "@/app/_components/DashboardScreen/components/Headline/index.tsx";

const TOTAL = "R$ 10,00";
const NEGATIVE = "−R$ 1,00";

describe("Headline", () => {
  it("pairs the caption with the figure", () => {
    render(<Headline caption="Valor total no período">{TOTAL}</Headline>);

    expect(screen.getByText("Valor total no período")).toBeInTheDocument();
    expect(screen.getByText(TOTAL)).toBeInTheDocument();
  });

  it("accents the figure when the card has a tone", () => {
    render(
      <Headline caption="Saldo" tone="negative">
        {NEGATIVE}
      </Headline>,
    );

    expect(screen.getByText(NEGATIVE)).toHaveClass("negative");
  });
});
