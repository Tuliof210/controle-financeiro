import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Icon } from "@/components/Icon/index.tsx";

describe("Icon", () => {
  it("is an image when given a title", () => {
    render(<Icon name="wallet" title="Carteira" />);

    expect(screen.getByRole("img", { name: "Carteira" })).toBeInTheDocument();
  });

  it("is presentation without a title", () => {
    const { container } = render(<Icon name="plus" />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("role", "presentation");
    expect(svg?.querySelector("title")).toBeNull();
  });

  it("draws the named path on the 24 grid", () => {
    const { container } = render(<Icon name="check" />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg?.querySelector("path")).toHaveAttribute("d");
  });
});
