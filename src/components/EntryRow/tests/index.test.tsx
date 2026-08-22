import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntryRow } from "@/components/EntryRow/index.tsx";
import type { Person } from "@/core/entities/person.entity.ts";
import type { Entry } from "@/lib/entry-types.ts";

const entry = {
  id: "e1",
  name: "Aluguel",
  valueCents: 150_000,
  type: "expense",
  ownerId: "p1",
} as Entry;

const ana = { id: "p1", name: "Ana", color: "violet" } as Person;

const props = {
  entry,
  person: ana,
  period: "Ago/26",
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("EntryRow", () => {
  it("shows the name, owner, period and formatted amount", () => {
    render(<EntryRow {...props} />);

    expect(screen.getByText("Aluguel")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Ago/26")).toBeInTheDocument();
    expect(screen.getByLabelText("R$ 1.500,00")).toBeInTheDocument();
  });

  it("renders badges between the name and the owner", () => {
    render(<EntryRow {...props} badges={<span>Fixa</span>} />);

    const name = screen.getByText("Aluguel");
    const badge = screen.getByText("Fixa");
    const owner = screen.getByText("Ana");

    expect(name.compareDocumentPosition(badge)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(badge.compareDocumentPosition(owner)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("names both row actions after the entry", () => {
    render(<EntryRow {...props} />);

    expect(
      screen.getByRole("button", { name: "Editar Aluguel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Excluir Aluguel" }),
    ).toBeInTheDocument();
  });

  it("renders no band cell until the entity has one", () => {
    const { rerender } = render(<EntryRow {...props} />);

    expect(screen.queryByText("barra")).not.toBeInTheDocument();

    rerender(<EntryRow {...props} band="barra" />);

    expect(screen.getByText("barra")).toBeInTheDocument();
  });

  it("calls back on edit and on delete", async () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(<EntryRow {...props} onEdit={onEdit} onDelete={onDelete} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Editar Aluguel" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Excluir Aluguel" }),
    );

    expect(onEdit).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });
});
