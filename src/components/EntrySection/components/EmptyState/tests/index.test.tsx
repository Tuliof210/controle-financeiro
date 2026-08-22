import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/EntrySection/components/EmptyState/index.tsx";

describe("EmptyState", () => {
  it("shows the title and the hint under a decorative icon", () => {
    const { container } = render(
      <EmptyState icon="wallet" title="Nada aqui" hint="Adicione um" />,
    );

    expect(screen.getByText("Nada aqui")).toBeInTheDocument();
    expect(screen.getByText("Adicione um")).toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
