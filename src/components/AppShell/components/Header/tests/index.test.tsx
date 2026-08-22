import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/AppShell/components/Header/index.tsx";
import { SIDEBAR_ID } from "@/components/AppShell/ids.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));

beforeEach(() => {
  jest.mocked(useProfile).mockReturnValue({
    label: "Família",
    profile: "familia",
    people: [],
    setProfile: jest.fn(),
  } as never);
});

const THEME_LABEL = /Ativar tema/;

describe("Header", () => {
  it("wires the menu button to the sidebar it controls", () => {
    render(<Header sidebarExpanded={true} onToggleSidebar={jest.fn()} />);

    const toggle = screen.getByRole("button", { name: "Alternar menu" });

    expect(toggle).toHaveAttribute("aria-controls", SIDEBAR_ID);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("reports the press to the shell", async () => {
    const onToggleSidebar = jest.fn();
    render(
      <Header sidebarExpanded={false} onToggleSidebar={onToggleSidebar} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Alternar menu" }),
    );

    expect(onToggleSidebar).toHaveBeenCalled();
  });

  it("carries the profile select and the theme toggle", () => {
    render(<Header sidebarExpanded={true} onToggleSidebar={jest.fn()} />);

    expect(screen.getByLabelText("Perfil ativo")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: THEME_LABEL }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Família" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Família" })).not.toHaveAttribute(
      "aria-hidden",
    );
  });
});
