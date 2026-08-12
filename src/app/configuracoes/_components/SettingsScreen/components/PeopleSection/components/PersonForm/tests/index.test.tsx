import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PersonForm } from "@/app/configuracoes/_components/SettingsScreen/components/PeopleSection/components/PersonForm/index.tsx";

describe("PersonForm", () => {
  it("cannot be submitted with a blank name", () => {
    render(<PersonForm submitLabel="Adicionar" onSubmit={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Adicionar" })).toBeDisabled();
  });

  it("submits the typed name and the picked colour", async () => {
    const onSubmit = jest.fn();
    render(<PersonForm submitLabel="Adicionar" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("Nome"), "Ana");
    await userEvent.click(screen.getByRole("radio", { name: "cyan" }));
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(onSubmit).toHaveBeenCalledWith({ name: "Ana", color: "cyan" });
  });

  it("shows the section's error on the name field", () => {
    render(
      <PersonForm
        submitLabel="Salvar"
        initial={{ name: "Ana", color: "lime" }}
        error="Já existe uma pessoa com esse nome"
        onSubmit={jest.fn()}
      />,
    );

    expect(
      screen.getByText("Já existe uma pessoa com esse nome"),
    ).toBeInTheDocument();
  });
});
