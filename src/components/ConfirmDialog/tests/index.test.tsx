import "@testing-library/jest-dom/jest-globals";
import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "@/components/ConfirmDialog/index.tsx";

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

const props = {
  open: true,
  onClose: jest.fn(),
  onConfirm: jest.fn<() => void>(),
  title: "Excluir pessoa",
  message: "Isso não pode ser desfeito.",
};

describe("ConfirmDialog", () => {
  it("shows the message under the title, with both actions", () => {
    render(<ConfirmDialog {...props} />);

    expect(screen.getByText(props.message)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancelar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });

  it("shows a refusal raised by the confirm action", () => {
    render(<ConfirmDialog {...props} error="Pessoa possui registros" />);

    expect(screen.getByText("Pessoa possui registros")).toBeInTheDocument();
  });

  it("confirms and cancels through their own buttons", async () => {
    const onConfirm = jest.fn<() => void>();
    const onClose = jest.fn();
    render(
      <ConfirmDialog
        {...props}
        onConfirm={onConfirm}
        onClose={onClose}
        confirmLabel="Importar"
        danger={false}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Importar" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
