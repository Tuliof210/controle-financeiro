import { describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { usePersonForm } from "@/app/perfil/_components/SettingsScreen/components/PeopleSection/components/PersonForm/hook.ts";
import { PALETTE } from "@/lib/palette.ts";

describe("usePersonForm", () => {
  it("starts empty, on the first palette colour", () => {
    const { result } = renderHook(() =>
      usePersonForm({ initial: undefined, onSubmit: jest.fn() }),
    );

    expect(result.current).toMatchObject({ name: "", color: PALETTE[0] });
  });

  it("seeds from the person being edited", () => {
    const { result } = renderHook(() =>
      usePersonForm({
        initial: { name: "Ana", color: "lime" },
        onSubmit: jest.fn(),
      }),
    );

    expect(result.current).toMatchObject({ name: "Ana", color: "lime" });
  });

  it("trims the name on submit", () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      usePersonForm({ initial: undefined, onSubmit }),
    );

    act(() => {
      result.current.setName("  Ana  ");
      result.current.setColor("cyan");
    });
    act(() => {
      result.current.submit();
    });

    expect(onSubmit).toHaveBeenCalledWith({ name: "Ana", color: "cyan" });
  });
});
