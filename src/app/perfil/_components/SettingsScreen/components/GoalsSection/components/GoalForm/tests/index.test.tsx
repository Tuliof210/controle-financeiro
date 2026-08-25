import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalForm } from "@/app/perfil/_components/SettingsScreen/components/GoalsSection/components/GoalForm/index.tsx";

describe("GoalForm", () => {
  it("cannot be submitted with a blank name", () => {
    render(<GoalForm submitLabel="Adicionar" onSubmit={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Adicionar" })).toBeDisabled();
  });

  it("seeds from the goal being edited", () => {
    render(
      <GoalForm
        submitLabel="Salvar"
        initial={{ name: "Casa", targetCents: 5000 }}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("Nome")).toHaveValue("Casa");
    expect(screen.getByLabelText("Valor alvo")).toHaveValue("50,00");
  });

  it("shows its own refusal before the section's error", async () => {
    render(
      <GoalForm
        submitLabel="Adicionar"
        error="Erro do servidor"
        onSubmit={jest.fn()}
      />,
    );

    await userEvent.type(screen.getByLabelText("Nome"), "Casa");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(
      screen.getByText("Informe um valor maior que zero"),
    ).toBeInTheDocument();
  });

  it("shows the section's error while the form itself is clean", () => {
    render(
      <GoalForm
        submitLabel="Adicionar"
        error="Erro do servidor"
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByText("Erro do servidor")).toBeInTheDocument();
  });
});
