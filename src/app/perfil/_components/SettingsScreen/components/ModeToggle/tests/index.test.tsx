import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModeToggle } from "@/app/perfil/_components/SettingsScreen/components/ModeToggle/index.tsx";

describe("ModeToggle", () => {
  it("renders a native radio group under its legend", () => {
    render(
      <ModeToggle
        name="ceiling-mode"
        legend="Como definir"
        value="percent"
        onChange={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("group", { name: "Como definir" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Porcentagem" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Valor fixo" })).not.toBeChecked();
  });

  it("reports the mode the reader picked", async () => {
    const onChange = jest.fn();
    render(
      <ModeToggle
        name="ceiling-mode"
        legend="Como definir"
        value="percent"
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("radio", { name: "Valor fixo" }));

    expect(onChange).toHaveBeenCalledWith("fixed");
  });

  it("keeps two toggles on a page in separate radio groups", () => {
    render(
      <>
        <ModeToggle
          name="ceiling-mode"
          legend="Teto"
          value="percent"
          onChange={jest.fn()}
        />
        <ModeToggle
          name="goals-mode"
          legend="Objetivos"
          value="fixed"
          onChange={jest.fn()}
        />
      </>,
    );

    const names = screen
      .getAllByRole("radio")
      .map((radio) => (radio as HTMLInputElement).name);

    expect(new Set(names).size).toBe(2);
  });
});
