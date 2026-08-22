import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/Card/index.tsx";

describe("Card", () => {
  it("renders its children on a generic box", () => {
    render(<Card>saldo</Card>);

    expect(screen.getByText("saldo")).toBeInTheDocument();
  });

  it("can be a section", () => {
    render(
      <Card as="section">
        <h2>Teto</h2>
      </Card>,
    );

    expect(screen.getByRole("heading", { name: "Teto" })).toBeInTheDocument();
  });

  it("draws sunken and outline without a second skin", () => {
    const { rerender, container } = render(
      <Card variant="sunken">sunken</Card>,
    );

    expect(container.firstChild).toHaveClass("sunken");

    rerender(<Card variant="outline">outline</Card>);

    expect(container.firstChild).toHaveClass("outline");
  });
});
