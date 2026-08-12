import "@testing-library/jest-dom/jest-globals";
import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { act, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { useModal } from "@/components/Modal/hook.ts";

// jsdom has no top layer, so showModal/close are stubbed onto the prototype.
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

// The hook owns a ref to a real <dialog>, so it runs inside the smallest host
// that can give it one — not Modal. createElement, not JSX: `.ts` sibling.
interface HostProps {
  open: boolean;
  onClose: () => void;
}

function Host({ open, onClose }: HostProps) {
  const { ref, handleClose } = useModal({ open, onClose });

  return createElement(
    "dialog",
    { "data-testid": "dialog", ref, onClose: handleClose },
    createElement("div", { "data-testid": "panel" }, "conteúdo"),
  );
}

const mount = (open: boolean) => {
  const onClose = jest.fn();
  const view = render(createElement(Host, { open, onClose }));
  return { view, onClose, dialog: screen.getByTestId("dialog") };
};

describe("useModal", () => {
  it("opens the native dialog when asked", () => {
    expect(mount(true).dialog).toHaveAttribute("open");
  });

  it("leaves it shut while open is false", () => {
    expect(mount(false).dialog).not.toHaveAttribute("open");
  });

  it("closes it again when open goes false", () => {
    const { view, dialog, onClose } = mount(true);

    view.rerender(createElement(Host, { open: false, onClose }));

    expect(dialog).not.toHaveAttribute("open");
  });

  it("bubbles the native close up while still open", () => {
    const { dialog, onClose } = mount(true);

    act(() => {
      dialog.dispatchEvent(new Event("close"));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("stays quiet when the close came from our own effect", () => {
    const { dialog, onClose } = mount(false);

    act(() => {
      dialog.dispatchEvent(new Event("close"));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on a click that lands on the backdrop", () => {
    const { dialog, onClose } = mount(true);

    act(() => {
      dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("ignores a click inside the panel", () => {
    const { onClose } = mount(true);

    act(() => {
      screen
        .getByTestId("panel")
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
