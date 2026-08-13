import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { SavingsSection } from "@/app/_components/DashboardScreen/components/SavingsSection/index.tsx";

const goal = {
  id: "g1",
  name: "Casa",
  targetCents: 150_000,
  dedicated: { months: 3, doneMonth: 202_603 },
  parallel: { months: 6, doneMonth: 202_606 },
  serialized: { months: 12, doneMonth: 202_612 },
};

const data = (goals: unknown[]) =>
  ({ goals, pace: 250, ceiling: { months: [{}, {}, {}] } }) as BoardData;

describe("SavingsSection", () => {
  it("heads the card with the saving capacity", () => {
    const { container } = render(<SavingsSection data={data([goal])} />);

    expect(
      screen.getByRole("heading", { name: "Capacidade de poupança" }),
    ).toBeInTheDocument();
    // toHaveTextContent, not getByText: the figure is two text nodes now — its
    // cents are their own dimmed span — and getByText reads only an element's
    // DIRECT text children.
    expect(container.querySelector(".value")).toHaveTextContent("R$ 2,50");
  });

  it("lists one row per goal, under the four column labels", () => {
    render(<SavingsSection data={data([goal])} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Casa")).toBeInTheDocument();
  });

  it("points at Configurações when there is no goal yet", () => {
    render(<SavingsSection data={data([])} />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configurações" })).toHaveAttribute(
      "href",
      "/configuracoes",
    );
  });
});
