import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForecastForm } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastForm/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";

jest.mock("../../../../../../../components/ProfileProvider/hook.ts", () => ({
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

describe("ForecastForm", () => {
  it("puts the interval list and the simulation flag in the period slot", () => {
    render(<ForecastForm {...props} />);

    expect(
      screen.getByRole("button", { name: "Adicionar intervalo" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Simulação")).not.toBeChecked();
  });

  it("explains what a simulation does to the board", () => {
    render(<ForecastForm {...props} />);

    expect(
      screen.getByText("O dashboard só soma simulações quando você pedir."),
    ).toBeInTheDocument();
  });

  it("flags the forecast as a simulation", async () => {
    render(<ForecastForm {...props} />);

    await userEvent.click(screen.getByLabelText("Simulação"));

    expect(screen.getByLabelText("Simulação")).toBeChecked();
  });

  it("prefixes the shared fields with forecast", () => {
    render(<ForecastForm {...props} />);

    expect(screen.getByLabelText("Nome")).toHaveAttribute(
      "id",
      "forecast-name",
    );
  });
});
