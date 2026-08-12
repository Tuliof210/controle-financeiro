import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useSimulationSelect } from "@/app/_components/DashboardScreen/components/SimulationSelect/hook.ts";

describe("useSimulationSelect", () => {
  it("reports the picked option as a plain string", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useSimulationSelect({ onChange }));

    result.current.handleChange({
      target: { value: "all" },
    } as React.ChangeEvent<HTMLSelectElement>);

    expect(onChange).toHaveBeenCalledWith("all");
  });
});
