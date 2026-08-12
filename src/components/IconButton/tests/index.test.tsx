import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { IconButton } from "@/components/IconButton/index.tsx";

describe("IconButton", () => {
  it("renders a button named by its aria-label", () => {
    render(
      <IconButton aria-label="Remover">
        <svg aria-hidden={true} />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: "Remover" })).toBeInTheDocument();
  });
});
