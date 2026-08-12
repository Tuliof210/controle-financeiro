import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import Page, { metadata } from "@/app/movimentacoes/page.tsx";

jest.mock("@/app/movimentacoes/_components/MovementsScreen/index.tsx", () => ({
  MovementsScreen: () => <p>MovementsScreen</p>,
}));

describe("movimentacoes page", () => {
  it("titles the tab", () => {
    expect(metadata.title).toBe("Movimentações");
  });

  it("renders nothing but its screen", () => {
    render(<Page />);

    expect(screen.getByText("MovementsScreen")).toBeInTheDocument();
  });
});
