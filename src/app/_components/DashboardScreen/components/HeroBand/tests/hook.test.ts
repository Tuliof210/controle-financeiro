import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { useHeroBand } from "@/app/_components/DashboardScreen/components/HeroBand/hook.ts";
import type { Ceiling } from "@/app/api/dashboard/ceiling.types.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, cumulative, income: 1000, expense: 400 }) as MonthPoint;

const ceiling = (over: Partial<Ceiling> = {}) =>
  ({
    monthly: 386_030,
    weekly: 96_507,
    daily: 12_867,
    tightest: 202_608,
    firstRed: null,
    months: [],
    ...over,
  }) as Ceiling;

const data = (points: MonthPoint[], over: Partial<BoardData> = {}) =>
  ({
    points,
    range: { start: 202_601, end: 202_603, current: 202_601 },
    ceiling: ceiling(),
    meta: null,
    ...over,
  }) as BoardData;

const band = (payload?: BoardData) =>
  renderHook(() => useHeroBand({ data: payload, cap: "50" })).result.current;

describe("useHeroBand", () => {
  it("renders no figure while the payload has not landed", () => {
    expect(band().figures).toBeNull();
  });

  it("renders no figure for a payload with no month in it", () => {
    expect(band(data([])).figures).toBeNull();
  });

  // The headline is the ceiling, not the projection at the far end of the range:
  // the loudest figure on the page used to be the one least useful for the
  // decision the page exists to support.
  it("heads the band with this month's ceiling", () => {
    const { figures } = band(data([point(202_601, 100), point(202_603, 500)]));

    expect(figures?.value).toBe(386_030);
  });

  // Note what the sentence does NOT contain: the headline directly above it is
  // the figure, and printing it twice is what MoneyFigure exists to prevent.
  it("states the verdict without repeating the figure", () => {
    const { figures } = band(data([point(202_601, 100)]));

    expect(figures?.verdict).toEqual({
      tone: "positive",
      sentence: "Dá para gastar sem nenhum mês fechar negativo.",
      limit: "Limitado por Ago/26",
    });
  });

  it("demotes the projected balance to a fact rather than dropping it", () => {
    const { figures } = band(data([point(202_601, 100), point(202_603, 500)]));

    expect(figures?.facts[0]).toMatchObject({
      key: "projected",
      label: "Saldo projetado",
      sub: "Mar/26",
    });
  });

  it("carries the bottom strip's four facts", () => {
    const { figures } = band(data([point(202_601, 100)]));

    expect(figures?.facts).toHaveLength(4);
  });
});
