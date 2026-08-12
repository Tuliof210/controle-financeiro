import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MovementForm } from "@/app/movimentacoes/_components/MovementsScreen/components/MovementForm/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));

const props = {
  submitLabel: "Adicionar",
  people: [{ id: "p1", name: "Ana" }] as Person[],
  onSubmit: jest.fn(),
};

beforeEach(() => {
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
});

describe("MovementForm", () => {
  it("puts a single month picker in the period slot", () => {
    render(<MovementForm {...props} />);

    expect(screen.getByLabelText("Mês - mês")).toBeInTheDocument();
    expect(screen.getByLabelText("Mês - ano")).toBeInTheDocument();
  });

  it("prefixes the shared fields with movement", () => {
    render(<MovementForm {...props} />);

    expect(screen.getByLabelText("Nome")).toHaveAttribute(
      "id",
      "movement-name",
    );
  });

  it("cannot be submitted while the shared fields are empty", () => {
    render(<MovementForm {...props} />);

    expect(screen.getByRole("button", { name: "Adicionar" })).toBeDisabled();
  });

  it("shows the screen's error while the form itself is clean", () => {
    render(<MovementForm {...props} error="Erro do servidor" />);

    expect(screen.getByText("Erro do servidor")).toBeInTheDocument();
  });
});
