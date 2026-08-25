import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalsLimitSection } from "@/app/perfil/_components/SettingsScreen/components/GoalsLimitSection/index.tsx";

const MAXIMO = /No máximo R\$ 500,00/;

const base = {
  percent: 25,
  cents: 700,
  headroomKind: "ok" as const,
  maxCents: 50_000,
  onModeChange: jest.fn(),
  onPercentChange: jest.fn(),
  onCentsChange: jest.fn(),
};

describe("GoalsLimitSection", () => {
  it("keeps the essay in the hint and offers both modes", () => {
    render(<GoalsLimitSection {...base} mode="percent" />);

    expect(
      screen.getByRole("heading", { name: "Limite em objetivos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Como Limite em objetivos é calculado",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Porcentagem do teto")).toHaveValue("25");
  });

  it("swaps to the amount and its maximum in fixed mode", () => {
    render(<GoalsLimitSection {...base} mode="fixed" />);

    expect(screen.getByLabelText("Limite mensal")).toHaveValue("7,00");
    expect(screen.getByText(MAXIMO)).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Porcentagem do teto"),
    ).not.toBeInTheDocument();
  });

  it("reports what the reader typed and picked", async () => {
    const onPercentChange = jest.fn();
    const onModeChange = jest.fn();
    render(
      <GoalsLimitSection
        {...base}
        mode="percent"
        onPercentChange={onPercentChange}
        onModeChange={onModeChange}
      />,
    );

    await userEvent.type(screen.getByLabelText("Porcentagem do teto"), "0");
    await userEvent.click(screen.getByRole("radio", { name: "Valor fixo" }));

    expect(onPercentChange).toHaveBeenCalledWith("250");
    expect(onModeChange).toHaveBeenCalledWith("fixed");
  });

  it("keeps its own radio group, apart from the ceiling card's", () => {
    render(<GoalsLimitSection {...base} mode="percent" />);

    const [first] = screen.getAllByRole("radio");

    expect((first as HTMLInputElement).name).toBe("goals-mode");
  });
});
