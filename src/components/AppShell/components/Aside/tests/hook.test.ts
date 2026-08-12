import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { act, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { createElement } from "react";
import { useAside } from "@/components/AppShell/components/Aside/hook.ts";

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));

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

interface HostProps {
  collapsed: boolean;
  drawerOpen: boolean;
  onToggle: () => void;
  onCloseDrawer: () => void;
}

let latest: ReturnType<typeof useAside>;

function Host(props: HostProps) {
  latest = useAside(props);
  return createElement("dialog", { "data-testid": "aside", ref: latest.ref });
}

const mount = (drawerOpen: boolean, collapsed = false) => {
  const onCloseDrawer = jest.fn();
  const onToggle = jest.fn();
  const view = render(
    createElement(Host, { collapsed, drawerOpen, onToggle, onCloseDrawer }),
  );
  return { view, onCloseDrawer, onToggle, aside: screen.getByTestId("aside") };
};

beforeEach(() => {
  jest.mocked(usePathname).mockReturnValue("/previsoes");
});

describe("useAside", () => {
  it("names the toggle after the state it switches to", () => {
    const { view } = mount(false);
    expect(latest.toggleLabel).toBe("Recolher menu");

    view.unmount();
    mount(false, true);
    expect(latest.toggleLabel).toBe("Expandir menu");
  });

  it("adds the collapsed class only on the rail", () => {
    const { view } = mount(false);
    expect(latest.className).not.toContain("collapsed");

    view.unmount();
    mount(false, true);
    expect(latest.className).toContain("collapsed");
  });

  it("opens the drawer as a native modal below md", () => {
    const { aside } = mount(true);

    expect(aside).toHaveAttribute("open");
  });

  it("closes the drawer on every route change", () => {
    const { onCloseDrawer } = mount(true);

    expect(onCloseDrawer).toHaveBeenCalled();
  });

  it("bubbles the native close up only while the drawer is open", () => {
    const { onCloseDrawer } = mount(false);
    onCloseDrawer.mockClear();

    act(() => {
      latest.handleClose();
    });

    expect(onCloseDrawer).not.toHaveBeenCalled();
  });

  it("closes on a click that lands on the backdrop", () => {
    const { aside, onCloseDrawer } = mount(true);
    onCloseDrawer.mockClear();

    act(() => {
      aside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onCloseDrawer).toHaveBeenCalled();
  });
});
