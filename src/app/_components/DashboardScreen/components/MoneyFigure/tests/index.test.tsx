import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react";
import { MoneyFigure } from "@/app/_components/DashboardScreen/components/MoneyFigure/index.tsx";

describe("MoneyFigure", () => {
  it("still reads as one uninterrupted figure", () => {
    const { container } = render(<MoneyFigure cents={123_456} />);

    // The whole point of splitting is that it must NOT change what the figure
    // says — only how the cents are painted.
    expect(container).toHaveTextContent("R$ 1.234,56");
  });

  it("puts only the cents in the dimmed span, comma included on the head", () => {
    const { container } = render(<MoneyFigure cents={123_456} />);

    expect(container.querySelector(".fraction")).toHaveTextContent("56");
    expect(container.querySelector(".fraction")).not.toHaveTextContent(",");
  });

  it("keeps the minus sign on a negative figure", () => {
    const { container } = render(<MoneyFigure cents={-64_000} />);

    expect(container).toHaveTextContent("−R$ 640,00");
  });
});
