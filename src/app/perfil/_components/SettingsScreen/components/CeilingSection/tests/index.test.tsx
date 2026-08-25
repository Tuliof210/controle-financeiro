import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CeilingSection } from "@/app/perfil/_components/SettingsScreen/components/CeilingSection/index.tsx";

const SEM_VERMELHO = /nenhum mês futuro fechar no vermelho/;
const MAXIMO = /No máximo R\$ 500,00/;
const SEM_MAXIMO = /não há máximo a respeitar/;

const base = {
  percent: 50,
  cents: 700,
  maxCents: 50_000,
  onModeChange: jest.fn(),
  onPercentChange: jest.fn(),
  onCentsChange: jest.fn(),
};

describe("CeilingSection", () => {
  it("explains the ceiling and offers both modes", () => {
    render(<CeilingSection {...base} mode="percent" />);

    expect(
      screen.getByRole("heading", { name: "Teto de Gastos" }),
    ).toBeInTheDocument();
    expect(screen.getByText(SEM_VERMELHO)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Porcentagem" })).toBeChecked();
  });

  it("shows only the percentage input in percentage mode", () => {
    render(<CeilingSection {...base} mode="percent" />);

    expect(
      screen.getByLabelText("Porcentagem do saldo disponível"),
    ).toHaveValue("50");
    expect(screen.queryByLabelText("Teto mensal")).not.toBeInTheDocument();
  });

  it("shows the amount and its maximum in fixed mode", () => {
    render(<CeilingSection {...base} mode="fixed" />);

    expect(screen.getByLabelText("Teto mensal")).toHaveValue("7,00");
    expect(screen.getByText(MAXIMO)).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Porcentagem do saldo disponível"),
    ).not.toBeInTheDocument();
  });

  it("says there is no maximum when the period is empty", () => {
    render(<CeilingSection {...base} mode="fixed" maxCents={null} />);

    expect(screen.getByText(SEM_MAXIMO)).toBeInTheDocument();
  });

  it("reports what the reader typed and picked", async () => {
    const onPercentChange = jest.fn();
    const onModeChange = jest.fn();
    render(
      <CeilingSection
        {...base}
        mode="percent"
        onPercentChange={onPercentChange}
        onModeChange={onModeChange}
      />,
    );

    await userEvent.type(
      screen.getByLabelText("Porcentagem do saldo disponível"),
      "7",
    );
    await userEvent.click(screen.getByRole("radio", { name: "Valor fixo" }));

    expect(onPercentChange).toHaveBeenCalledWith("507");
    expect(onModeChange).toHaveBeenCalledWith("fixed");
  });
});
