import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Tooltip } from "@/components/Tooltip/index.tsx";

describe("Tooltip", () => {
  it("keeps the bubble in the DOM so aria-describedby always resolves", () => {
    render(<Tooltip text="Como o teto sai" />);

    const trigger = screen.getByRole("button");
    const bubble = screen.getByRole("tooltip");

    expect(bubble).toHaveTextContent("Como o teto sai");
    expect(trigger).toHaveAttribute("aria-describedby", bubble.id);
  });

  it("names the trigger after the caller's label", () => {
    render(<Tooltip text="x" label="Como Teto é calculado" />);

    expect(
      screen.getByRole("button", { name: "Como Teto é calculado" }),
    ).toBeInTheDocument();
  });
});
