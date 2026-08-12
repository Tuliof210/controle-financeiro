import "@testing-library/jest-dom/jest-globals";
import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/components/Modal/index.tsx";

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

describe("Modal", () => {
  it("renders the title over its children", () => {
    render(
      <Modal open={true} onClose={jest.fn()} title="Nova pessoa">
        corpo
      </Modal>,
    );

    expect(
      screen.getByRole("heading", { name: "Nova pessoa" }),
    ).toBeInTheDocument();
    expect(screen.getByText("corpo")).toBeInTheDocument();
  });

  it("renders the eyebrow and footer only when given", () => {
    const { rerender } = render(
      <Modal open={true} onClose={jest.fn()} title="T">
        corpo
      </Modal>,
    );

    expect(screen.queryByText("Cadastro")).not.toBeInTheDocument();

    rerender(
      <Modal
        open={true}
        onClose={jest.fn()}
        title="T"
        eyebrow="Cadastro"
        footer={<button type="button">Salvar</button>}
      >
        corpo
      </Modal>,
    );

    expect(screen.getByText("Cadastro")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("closes from the close button", async () => {
    const onClose = jest.fn();
    render(
      <Modal open={true} onClose={onClose} title="T">
        corpo
      </Modal>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalled();
  });
});
