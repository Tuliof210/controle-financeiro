import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { RowGrid } from "@/components/RowGrid/index.tsx";

describe("RowGrid", () => {
  it("renders a list holding the rows it is given", () => {
    render(
      <RowGrid>
        <li>Aluguel</li>
        <li>Mercado</li>
      </RowGrid>,
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
