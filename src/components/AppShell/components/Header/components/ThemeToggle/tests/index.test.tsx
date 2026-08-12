import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/AppShell/components/Header/components/ThemeToggle/index.tsx";

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
  localStorage.clear();
});

describe("ThemeToggle", () => {
  it("names the theme it will switch to", async () => {
    render(<ThemeToggle />);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Ativar tema escuro" }),
      ).toBeInTheDocument(),
    );
  });

  it("flips the document theme when pressed", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button"));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Ativar tema claro" }),
    ).toBeInTheDocument();
  });
});
