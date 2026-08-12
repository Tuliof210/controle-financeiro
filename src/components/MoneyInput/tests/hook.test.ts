import { act, renderHook } from "@testing-library/react";
import { useMoneyInput } from "@/components/MoneyInput/hook";

const REAIS_1234_56 = 123_456;

const changeEvent = (value: string) =>
  ({ target: { value } }) as React.ChangeEvent<HTMLInputElement>;

describe("useMoneyInput", () => {
  it("formats the value it is given for display", () => {
    const { result } = renderHook(() =>
      useMoneyInput({ valueCents: REAIS_1234_56, onChange: jest.fn() }),
    );

    expect(result.current.display).toBe("1234,56");
  });

  it("reports typed text back as cents", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useMoneyInput({ valueCents: 0, onChange }),
    );

    act(() => {
      result.current.onChange(changeEvent("1.234,56"));
    });

    expect(onChange).toHaveBeenCalledWith(REAIS_1234_56);
  });

  it("passes the id and label through untouched", () => {
    const { result } = renderHook(() =>
      useMoneyInput({
        valueCents: 0,
        onChange: jest.fn(),
        id: "valor",
        ariaLabel: "Valor",
      }),
    );

    expect(result.current.id).toBe("valor");
    expect(result.current.ariaLabel).toBe("Valor");
  });
});
