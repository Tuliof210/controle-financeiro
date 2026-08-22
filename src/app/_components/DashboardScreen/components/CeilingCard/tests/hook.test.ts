import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useCeilingCard } from "@/app/_components/DashboardScreen/components/CeilingCard/hook.ts";
import type { Ceiling } from "@/app/api/dashboard/ceiling.types.ts";

const month = (value: number, budget: number) => ({
  month: value,
  budget,
  ceilingBalance: 1000,
  ceilingLeft: 1000 - budget,
});

const ceiling = (over: Partial<Ceiling> = {}): Ceiling =>
  ({
    monthly: 250,
    weekly: 62,
    daily: 8,
    tightest: 202_612,
    firstRed: null,
    months: [month(202_608, 250), month(202_609, 100)],
    ...over,
  }) as Ceiling;

const card = (
  over: Partial<Ceiling> = {},
  meta: number | null = null,
  cap = "50",
) =>
  renderHook(() =>
    useCeilingCard({
      ceiling: ceiling(over),
      meta,
      current: 202_608,
      cap: cap as never,
      onCapChange: jest.fn(),
    }),
  ).result.current;

describe("useCeilingCard", () => {
  it("formats the headline and its two cadences", () => {
    // Cents now: MoneyDisplay splits and formats it, so the hook stops
    // holding a second copy of the format.
    expect(card().monthly).toBe(250);
    expect(card().rates.map((rate) => rate.value)).toEqual([
      "R$ 0,62",
      "R$ 0,08",
    ]);
  });

  it("marks the current month and counts the ones left", () => {
    const { rows, monthsLeft, currentLabel } = card();

    expect(rows[0]).toMatchObject({ label: "Ago/26", isCurrent: true });
    expect(rows[1].isCurrent).toBe(false);
    expect(monthsLeft).toBe("2 meses restantes");
    expect(currentLabel).toBe("Ago/26");
  });

  it("names the bottleneck month while the headroom binds", () => {
    expect(card().limitedBy).toBe("Limitado por Dez/26");
  });

  it("names the goal instead once it is what bound the figure", () => {
    expect(card({ monthly: 250 }, 250, "meta").limitedBy).toBe(
      "Limitado pela meta",
    );
  });

  it("is empty only when no month anywhere offers anything", () => {
    expect(card().empty).toBe(false);
    expect(card({ months: [month(202_608, 0), month(202_609, 0)] }).empty).toBe(
      true,
    );
  });

  it("keeps a later month's room when only this one is zero", () => {
    expect(
      card({ months: [month(202_608, 0), month(202_609, 100)] }).empty,
    ).toBe(false);
  });

  it("explains an empty ceiling by naming the month that breaks", () => {
    expect(card({ firstRed: { month: 202_610, shortfall: 500 } }).note).toBe(
      "Sem teto: Out/26 fecha R$ 5,00 no vermelho.",
    );
  });

  it("reports how much of the list is on screen", () => {
    expect(card().count).toBe("2 de 2 meses");
  });

  it("offers the Meta segment only once a goal is saved", () => {
    expect(card().hasMeta).toBe(false);
    expect(card({}, 700).hasMeta).toBe(true);
  });
});
