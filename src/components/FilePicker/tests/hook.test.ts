import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useFilePicker } from "@/components/FilePicker/hook.ts";

const changeOn = (input: HTMLInputElement) =>
  ({ target: input }) as unknown as React.ChangeEvent<HTMLInputElement>;

const inputWith = (files: File[]) => {
  const input = document.createElement("input");
  input.type = "file";
  Object.defineProperty(input, "files", { value: files, writable: true });
  return input;
};

describe("useFilePicker", () => {
  it("passes the label and disabled state through", () => {
    const { result } = renderHook(() =>
      useFilePicker({ label: "Escolher", disabled: true, onFile: jest.fn() }),
    );

    expect(result.current).toMatchObject({
      label: "Escolher",
      disabled: true,
    });
  });

  it("opens the hidden input the ref points at", () => {
    const { result } = renderHook(() =>
      useFilePicker({ label: "Escolher", onFile: jest.fn() }),
    );
    const input = inputWith([]);
    const click = jest.spyOn(input, "click");
    result.current.inputRef.current = input;

    result.current.open();

    expect(click).toHaveBeenCalled();
  });

  it("reports the picked file", () => {
    const onFile = jest.fn();
    const { result } = renderHook(() =>
      useFilePicker({ label: "Escolher", onFile }),
    );
    const file = new File(["x"], "a.ofx");

    result.current.change(changeOn(inputWith([file])));

    expect(onFile).toHaveBeenCalledWith(file);
  });

  it("clears the input so the same file can be picked twice", () => {
    const { result } = renderHook(() =>
      useFilePicker({ label: "Escolher", onFile: jest.fn() }),
    );
    const input = inputWith([new File(["x"], "a.ofx")]);

    result.current.change(changeOn(input));

    expect(input.value).toBe("");
  });

  it("stays quiet when the dialog was dismissed", () => {
    const onFile = jest.fn();
    const { result } = renderHook(() =>
      useFilePicker({ label: "Escolher", onFile }),
    );

    result.current.change(changeOn(inputWith([])));

    expect(onFile).not.toHaveBeenCalled();
  });
});
