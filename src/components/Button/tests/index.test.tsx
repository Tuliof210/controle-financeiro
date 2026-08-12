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
});
