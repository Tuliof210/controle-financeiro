import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { Aside } from "@/components/AppShell/components/Aside/index.tsx";
import { SIDEBAR_ID } from "@/components/AppShell/ids.ts";
import { NAV } from "@/components/AppShell/nav.ts";

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    // jsdom has no top layer; the drawer only needs the call not to throw.
  };
  HTMLDialogElement.prototype.close = function close() {
    // Same: nothing to tear down without a top layer.
  };
});

const props = {
  collapsed: false,
  drawerOpen: false,
  onToggle: jest.fn(),
  onCloseDrawer: jest.fn(),
};

beforeEach(() => {
  jest.mocked(usePathname).mockReturnValue("/previsoes");
});

describe("Aside", () => {
  it("is a navigation landmark carrying the shared sidebar id", () => {
    render(<Aside {...props} />);

    // hidden: a closed <dialog> is display:none, and the rail is only shown
    // by CSS this environment does not apply.
    const nav = screen.getByRole("navigation", { hidden: true });

    expect(nav).toHaveAttribute("id", SIDEBAR_ID);
    expect(nav).toHaveAttribute("aria-label", "Navegação principal");
  });

  it("renders one link per destination and marks the current one", () => {
    render(<Aside {...props} />);

    expect(screen.getAllByRole("link", { hidden: true })).toHaveLength(
      NAV.length,
    );
    expect(
      screen.getByRole("link", { name: "Previsões", hidden: true }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("offers the collapse control, named by what it will do", async () => {
    const onToggle = jest.fn();
    render(<Aside {...props} onToggle={onToggle} />);

    const button = screen.getByRole("button", {
      name: "Recolher menu",
      hidden: true,
    });
    expect(button).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(button);

    expect(onToggle).toHaveBeenCalled();
  });
});
