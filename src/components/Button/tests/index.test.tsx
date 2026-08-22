import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/Button/index.tsx";

describe("Button", () => {
  it("renders a button carrying its children", () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("is not a submit button unless asked", () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("draws secondary, destructive, sm and a leading icon", () => {
    const { rerender, container } = render(
      <Button variant="secondary" size="sm" iconLeft="plus">
        Adicionar
      </Button>,
    );

    expect(
      screen.getByRole("button", { name: "Adicionar" }),
    ).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();

    rerender(
      <Button variant="destructive" size="sm">
        Excluir
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });
});
