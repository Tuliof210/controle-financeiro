import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CeilingSection } from "@/app/perfil/_components/SettingsScreen/components/CeilingSection/index.tsx";

const HINT = /Quanto ainda dá para gastar neste mês/;
const MAXIMO = /No máximo R\$ 500,00/;
const MAX_FAIL = /Não foi possível calcular o máximo/;

const base = {
  percent: 50,
  cents: 700,
  headroomKind: "ok" as const,
  maxCents: 50_000,
  monthlyCents: 12_000,
  onModeChange: jest.fn(),
  onPercentChange: jest.fn(),
  onCentsChange: jest.fn(),
};

describe("CeilingSection", () => {
  it("leads with this month's teto and keeps the essay in the hint", () => {
    render(<CeilingSection {...base} mode="percent" />);

    expect(
      screen.getByRole("heading", { name: "Teto de gastos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Como Teto de gastos é calculado" }),
    ).toBeInTheDocument();
    expect(screen.getByText(HINT)).toBeInTheDocument();
    expect(screen.getByText("este mês").parentElement).toHaveTextContent(
      "R$ 120,00",
    );
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

  it("does not claim an empty period when the dashboard failed", () => {
    render(
      <CeilingSection
        {...base}
        mode="fixed"
        headroomKind="error"
        maxCents={null}
        monthlyCents={null}
      />,
    );

    expect(
      screen.getByText("Não foi possível calcular o teto agora."),
    ).toBeInTheDocument();
    expect(screen.getByText(MAX_FAIL)).toBeInTheDocument();
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
