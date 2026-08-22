import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntrySection } from "@/components/EntrySection/index.tsx";
import type { Person } from "@/core/entities/person.entity.ts";
import type { Entry } from "@/lib/entry-types.ts";

const items = [
  {
    id: "e1",
    name: "Aluguel",
    valueCents: 150_000,
    type: "expense",
    ownerId: "p1",
  },
] as Entry[];

const props = {
  title: "Saídas",
  icon: "wallet",
  tone: "negative" as const,
  items,
  people: [{ id: "p1", name: "Ana" }] as Person[],
  period: null,
  labels: {
    add: "Nova saída",
    emptyTitle: "Nenhuma saída",
    emptyHint: "Adicione a primeira",
  },
  renderPeriod: () => "Ago/26",
  onAdd: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("EntrySection", () => {
  it("shows the total over one row per item", () => {
    render(<EntrySection {...props} />);

    // Twice: the section total and the single row that makes it up.
    expect(screen.getAllByText("R$ 1.500,00")).toHaveLength(2);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("shows the empty state instead of a list when there is nothing", () => {
    render(<EntrySection {...props} items={[]} />);

    expect(screen.getByText("Nenhuma saída")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("offers the add action, named by the section's own label", async () => {
    const onAdd = jest.fn();
    render(<EntrySection {...props} onAdd={onAdd} />);

    await userEvent.click(screen.getByRole("button", { name: "Nova saída" }));

    expect(onAdd).toHaveBeenCalled();
  });
});
