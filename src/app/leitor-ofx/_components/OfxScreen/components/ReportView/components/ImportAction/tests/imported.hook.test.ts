import { beforeEach, describe, expect, it } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { useImportedRecord } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/ImportAction/imported.hook.ts";
import { apiGet } from "@/lib/api.ts";

jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
}));

const get = jest.mocked(apiGet);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useImportedRecord", () => {
  it("asks the server, by hash, whether the file is on record", async () => {
    get.mockResolvedValue({ data: { imported: true, importedAt: "x" } });

    const { result } = renderHook(() => useImportedRecord("a b"));

    await waitFor(() =>
      expect(result.current[0]).toEqual({ imported: true, importedAt: "x" }),
    );
    expect(get).toHaveBeenCalledWith("/api/ofx-imports?hash=a%20b");
  });

  it("stays not-imported when the request fails", async () => {
    get.mockResolvedValue({ error: "Erro inesperado" });

    const { result } = renderHook(() => useImportedRecord("abc"));

    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(result.current[0]).toEqual({ imported: false, importedAt: null });
  });

  it("re-asks when the file is swapped", async () => {
    get.mockResolvedValue({ data: { imported: false, importedAt: null } });
    const { rerender } = renderHook((hash: string) => useImportedRecord(hash), {
      initialProps: "one",
    });

    rerender("two");

    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
  });
});
