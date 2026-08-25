import { describe, expect, it } from "@jest/globals";
import {
  limitLabel,
  monthsWord,
  noteFor,
  shareOf,
} from "@/app/_components/DashboardScreen/components/CeilingCard/ceiling-card.helper.ts";

describe("shareOf", () => {
  it("reads the budget as a share of the balance arriving", () => {
    expect(shareOf(250, 1000)).toBe(0.25);
  });

  it("yields nothing when no balance arrived", () => {
    expect(shareOf(100, 0)).toBe(0);
    expect(shareOf(100, -50)).toBe(0);
  });

  it("clamps a budget the type allows but the arithmetic never produces", () => {
    expect(shareOf(2000, 1000)).toBe(1);
  });
});

describe("limitLabel", () => {
  it("points at the Perfil setting when the ceiling is a fixed amount", () => {
    expect(limitLabel(true, 202_612)).toBe("Limitado pelo teto em Ajustes");
  });

  it("names the bottleneck month otherwise", () => {
    expect(limitLabel(false, 202_612)).toBe("Limitado por Dez/26");
  });

  it("says nothing when nothing is offered", () => {
    expect(limitLabel(false, null)).toBeNull();
  });
});

describe("noteFor", () => {
  it("names the first month in the red and how deep it goes", () => {
    expect(noteFor({ month: 202_604, shortfall: 150_000 })).toBe(
      "Sem teto: Abr/26 fecha R$ 1.500,00 no vermelho.",
    );
  });

  it("falls back when no month is underwater at all", () => {
    expect(noteFor(null)).toContain("não cobre nenhum gasto extra");
  });
});

describe("monthsWord", () => {
  it("agrees with the count", () => {
    expect(monthsWord(1)).toBe("mês restante");
    expect(monthsWord(6)).toBe("meses restantes");
  });
});
