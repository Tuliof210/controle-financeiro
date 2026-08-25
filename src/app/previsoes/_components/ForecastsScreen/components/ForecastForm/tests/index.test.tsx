import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForecastForm } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastForm/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));

const people = [{ id: "p1", name: "Ana" }] as Person[];
const props = {
  submitLabel: "Adicionar",
  people,
  onSubmit: jest.fn(),
};
const filled = {
  name: "Aluguel",
  valueCents: 150_000,
  type: "expense" as const,
  ownerId: "p1",
  months: [202_601, 202_602],
};

beforeEach(() => {
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
});

describe("ForecastForm", () => {
  it("puts intervals, kind radios and the simulation flag in the period slot", () => {
    render(<ForecastForm {...props} />);

    expect(
      screen.getByRole("button", { name: "Adicionar intervalo" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Fixa" })).toBeChecked();
    expect(screen.getByLabelText("Simulação")).not.toBeChecked();
  });

  it("explains what a simulation does to the board", () => {
    render(<ForecastForm {...props} />);

    expect(
      screen.getByText(
        "O dashboard só soma simulações quando isso estiver ligado em Ajustes.",
      ),
    ).toBeInTheDocument();
  });

  it("flags the forecast as a simulation", async () => {
    render(<ForecastForm {...props} />);

    await userEvent.click(screen.getByLabelText("Simulação"));

    expect(screen.getByLabelText("Simulação")).toBeChecked();
  });

  it("submits the kind the reader picked", async () => {
    const onSubmit = jest.fn();
    render(<ForecastForm {...props} initial={filled} onSubmit={onSubmit} />);

    await userEvent.click(
      screen.getByRole("radio", { name: "Compromisso futuro" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "commitment" }),
    );
  });

  it("seeds the kind of the forecast being edited", () => {
    render(
      <ForecastForm {...props} initial={{ ...filled, kind: "commitment" }} />,
    );

    expect(
      screen.getByRole("radio", { name: "Compromisso futuro" }),
    ).toBeChecked();
  });

  it("prefixes the shared fields with forecast", () => {
    render(<ForecastForm {...props} />);

    expect(screen.getByLabelText("Nome")).toHaveAttribute(
      "id",
      "forecast-name",
    );
  });
});
