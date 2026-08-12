import "@testing-library/jest-dom/jest-globals";
import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Modals } from "@/components/EntryScreen/components/Modals/index.tsx";
import type { EntryFormSlotProps } from "@/components/EntryScreen/types.ts";
import type { Entry, EntryType } from "@/lib/entry-types.ts";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: {
    open: boolean;
  }) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: { open: boolean }) {
    this.open = false;
  };
});

interface Values {
  type: EntryType;
}

const ADD = /Adicionar/;
const SAVE = /Salvar/;
const SAVE_PREFIX = /^Salvar:/;

const Form = ({ initial, submitLabel }: EntryFormSlotProps<Values>) => (
  <p>{`${submitLabel}:${JSON.stringify(initial)}`}</p>
);

const props = {
  labels: { addTitle: "Nova previsão", editTitle: "Editar previsão" },
  close: jest.fn(),
  people: [],
  onAdd: jest.fn(),
  onUpdate: jest.fn(),
  form: Form,
};

const entry = { id: "f1", name: "Aluguel" } as Entry;

describe("Modals", () => {
  it("mounts no form while nothing is open", () => {
    render(<Modals<Entry, Values> {...props} modal={{ type: "none" }} />);

    expect(screen.queryByText(ADD)).not.toBeInTheDocument();
    expect(screen.queryByText(SAVE)).not.toBeInTheDocument();
  });

  it("seeds the add form with the type the section asked for", () => {
    render(
      <Modals<Entry, Values>
        {...props}
        modal={{ type: "add", kind: "expense" }}
      />,
    );

    expect(
      screen.getByText('Adicionar:{"type":"expense"}'),
    ).toBeInTheDocument();
  });

  it("seeds the edit form with the entry being edited", () => {
    render(
      <Modals<Entry, Values> {...props} modal={{ type: "edit", entry }} />,
    );

    expect(screen.getByText(SAVE_PREFIX)).toHaveTextContent("Aluguel");
  });
});
