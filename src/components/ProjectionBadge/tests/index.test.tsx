import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { ProjectionBadge } from "@/components/ProjectionBadge/index.tsx";

describe("ProjectionBadge", () => {
  it("renders the kind label", () => {
    render(<ProjectionBadge kind="estimado" />);

    expect(screen.getByText("Estimado")).toBeInTheDocument();
  });

  it("renders Simulado for a what-if", () => {
    const { container } = render(<ProjectionBadge kind="simulado" />);

    expect(screen.getByText("Simulado")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("lets children override the label", () => {
    render(<ProjectionBadge kind="real">lançado</ProjectionBadge>);

    expect(screen.getByText("lançado")).toBeInTheDocument();
    expect(screen.queryByText("Real")).not.toBeInTheDocument();
  });
});
