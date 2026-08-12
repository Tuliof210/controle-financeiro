import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useUploadCard } from "@/app/leitor-ofx/_components/OfxScreen/components/UploadCard/hook.ts";

describe("useUploadCard", () => {
  it("hands the error and the callback straight back", () => {
    const onFile = jest.fn();
    const { result } = renderHook(() =>
      useUploadCard({ error: "Arquivo maior que 5 MB", onFile }),
    );

    expect(result.current).toEqual({
      error: "Arquivo maior que 5 MB",
      onFile,
    });
  });
});
