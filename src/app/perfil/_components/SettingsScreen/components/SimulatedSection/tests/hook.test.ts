import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { useSimulatedSection } from "@/app/perfil/_components/SettingsScreen/components/SimulatedSection/hook.ts";

const eventWith = (checked: boolean) =>
  ({ target: { checked } }) as ChangeEvent<HTMLInputElement>;

describe("useSimulatedSection", () => {
  it("passes the checkbox state straight through", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useSimulatedSection({ value: false, onChange }),
    );

    expect(result.current.value).toBe(false);

    result.current.handleChange(eventWith(true));

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
