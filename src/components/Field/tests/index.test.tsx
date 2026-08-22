import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Field } from "@/components/Field/index.tsx";

const text = {
  label: "Nome",
  value: "Ana",
  id: "nome",
  onChange: jest.fn<(value: string) => void>(),
};

describe("Field", () => {
  it("labels the input so it is reachable by its name", () => {
    render(<Field {...text} />);

    expect(screen.getByLabelText("Nome")).toHaveValue("Ana");
  });

  it("shows the error when one is given", () => {
    render(<Field {...text} error="Nome é obrigatório" />);

    expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
  });

  it("shows money formatted behind the currency prefix", () => {
    const money = {
      money: true as const,
      id: "valor",
      label: "Valor",
      value: 123_456,
      onChange: jest.fn<(value: number) => void>(),
    };
    render(<Field {...money} />);

    expect(screen.getByLabelText("Valor")).toHaveValue("1234,56");
    expect(screen.getByText("R$")).toBeInTheDocument();
    expect(screen.getByLabelText("Valor")).toHaveAttribute(
      "inputmode",
      "decimal",
    );
  });
});
