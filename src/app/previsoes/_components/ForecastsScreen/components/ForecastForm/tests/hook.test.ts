import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useForecastForm } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastForm/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));

const people = [{ id: "p1", name: "Ana" }] as Person[];

const filled = {
  name: "Aluguel",
  valueCents: 150_000,
  type: "expense" as const,
  ownerId: "p1",
  months: [202_601, 202_602],
};

const mount = (initial?: Record<string, unknown>, onSubmit = jest.fn()) =>
  renderHook(() => useForecastForm({ initial, people, onSubmit }));

beforeEach(() => {
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
});

describe("useForecastForm", () => {
  it("starts real, on one interval, and not submittable", () => {
    const { result } = mount();

    expect(result.current.simulated).toBe(false);
    expect(result.current.intervals).toHaveLength(1);
    expect(result.current.canSubmit).toBe(false);
  });

  it("seeds the intervals and the flag of the forecast being edited", () => {
    const { result } = mount({ ...filled, simulated: true });

    expect(result.current.intervals).toEqual([
      { key: 0, start: 202_601, end: 202_602 },
    ]);
    expect(result.current.simulated).toBe(true);
    expect(result.current.canSubmit).toBe(true);
  });

  it("refuses to submit an incomplete form, and says why", () => {
    const onSubmit = jest.fn();
    const { result } = mount(undefined, onSubmit);

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.localError).toBe(
      "Preencha nome, valor e responsável corretamente",
    );
  });

  it("refuses a form whose intervals cover no month", () => {
    const { result } = mount(filled);

    act(() => {
      result.current.updateInterval(0, { start: 202_604, end: 202_601 });
    });

    expect(result.current.canSubmit).toBe(false);
  });

  it("submits the entry base plus the flattened months and the flag", () => {
    const onSubmit = jest.fn();
    const { result } = mount(filled, onSubmit);

    act(() => {
      result.current.toggleSimulated();
    });
    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Aluguel",
      valueCents: 150_000,
      type: "expense",
      ownerId: "p1",
      months: [202_601, 202_602],
      simulated: true,
    });
  });
});
