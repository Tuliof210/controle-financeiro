import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntryForm } from "@/components/EntryForm/index.tsx";
import type { Person } from "@/core/entities/person.entity.ts";

const fields = {
  name: "Aluguel",
  setName: jest.fn(),
  valueCents: 150_000,
  setValueCents: jest.fn(),
  type: "expense" as const,
  setType: jest.fn(),
  ownerId: "p1",
  setOwnerId: jest.fn(),
};

const props = {
  idPrefix: "forecast",
  people: [{ id: "p1", name: "Ana" }] as Person[],
  fields,
  period: <p>periodo</p>,
  submitLabel: "Adicionar",
  canSubmit: true,
  onSubmit: jest.fn(),
};

describe("EntryForm", () => {
  it("renders the shared fields, prefixed by the caller's id", () => {
    render(<EntryForm {...props} />);

    expect(screen.getByLabelText("Nome")).toHaveAttribute(
      "id",
      "forecast-name",
    );
    expect(screen.getByLabelText("Valor")).toHaveValue("1500,00");
    expect(screen.getByLabelText("Responsável")).toHaveValue("p1");
  });

  it("renders the entity's own period control", () => {
    render(<EntryForm {...props} />);

    expect(screen.getByText("periodo")).toBeInTheDocument();
  });

  it("shows an error only when there is one", () => {
    const { rerender } = render(<EntryForm {...props} />);

    expect(screen.queryByText("Escolha um mês")).not.toBeInTheDocument();

    rerender(<EntryForm {...props} error="Escolha um mês" />);

    expect(screen.getByText("Escolha um mês")).toBeInTheDocument();
  });

  it("submits through the labelled button, disabled while invalid", async () => {
    const onSubmit = jest.fn();
    const { rerender } = render(
      <EntryForm {...props} canSubmit={false} onSubmit={onSubmit} />,
    );

    expect(screen.getByRole("button", { name: "Adicionar" })).toBeDisabled();

    rerender(<EntryForm {...props} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(onSubmit).toHaveBeenCalled();
  });
});
