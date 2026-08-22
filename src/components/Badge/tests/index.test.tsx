import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/Badge/index.tsx";

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge>Fixa</Badge>);

    expect(screen.getByText("Fixa")).toBeInTheDocument();
  });

  it("draws a leading icon when given one", () => {
    const { container } = render(<Badge icon="check">ok</Badge>);

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByText("ok")).toBeInTheDocument();
  });

  it("draws a status dot when asked", () => {
    const { container } = render(<Badge dot={true}>info</Badge>);

    expect(container.querySelector(".dot")).toBeInTheDocument();
  });
});
