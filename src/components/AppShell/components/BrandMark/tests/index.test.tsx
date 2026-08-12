import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { BrandMark } from "@/components/AppShell/components/BrandMark/index.tsx";

describe("BrandMark", () => {
  it("renders the logo as a named image", () => {
    render(<BrandMark />);

    expect(screen.getByRole("img", { name: "Monevo" })).toBeInTheDocument();
  });
});
