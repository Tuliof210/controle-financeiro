import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Sections } from "@/components/EntryScreen/components/Sections/index.tsx";
import type { EntryScreenLabels } from "@/components/EntryScreen/types.ts";
import type { Entry } from "@/lib/entry-types.ts";

const labels = {
  income: { add: "Nova entrada", emptyTitle: "Sem entradas", emptyHint: "b" },
  expense: { add: "Nova saída", emptyTitle: "Sem saídas", emptyHint: "d" },
} as EntryScreenLabels;

const props = {
  labels,
  income: [] as Entry[],
  expense: [] as Entry[],
  people: [],
  period: null,
  renderPeriod: () => null,
  onAdd: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("Sections", () => {
  it("renders both sections side by side", () => {
    render(<Sections {...props} />);

    expect(
      screen.getByRole("heading", { name: "Entradas" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Saídas" })).toBeInTheDocument();
  });

  it("gives each its own empty copy", () => {
    render(<Sections {...props} />);

    expect(screen.getByText("Sem entradas")).toBeInTheDocument();
    expect(screen.getByText("Sem saídas")).toBeInTheDocument();
  });
});
