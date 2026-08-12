import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { TextField } from "@/components/TextField/index.tsx";

const props = {
  label: "Nome",
  value: "Ana",
  id: "nome",
  onChange: jest.fn(),
};

const REQUIRED = /obrigat/i;

describe("TextField", () => {
  it("labels the input so it is reachable by its name", () => {
    render(<TextField {...props} />);

    expect(screen.getByLabelText("Nome")).toHaveValue("Ana");
  });

  it("shows no error line while there is no error", () => {
    render(<TextField {...props} />);

    expect(screen.queryByText(REQUIRED)).not.toBeInTheDocument();
  });

  it("shows the error when one is given", () => {
    render(<TextField {...props} error="Nome é obrigatório" />);

    expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
  });
});
