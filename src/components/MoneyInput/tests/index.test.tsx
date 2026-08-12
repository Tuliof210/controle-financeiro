import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MoneyInput } from "@/components/MoneyInput/index.tsx";

describe("MoneyInput", () => {
  it("shows the value formatted, behind the currency prefix", () => {
    render(
      <MoneyInput
        valueCents={123_456}
        onChange={jest.fn()}
        ariaLabel="Valor"
      />,
    );

    expect(screen.getByLabelText("Valor")).toHaveValue("1234,56");
    expect(screen.getByText("R$")).toBeInTheDocument();
  });

  it("asks for the numeric keypad", () => {
    render(
      <MoneyInput valueCents={0} onChange={jest.fn()} ariaLabel="Valor" />,
    );

    expect(screen.getByLabelText("Valor")).toHaveAttribute(
      "inputmode",
      "decimal",
    );
  });
});
