import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useImportAction } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/ImportAction/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet, apiPost } from "@/lib/api.ts";
import { people, report } from "./import-action-fixture.ts";

jest.mock(
  "../../../../../../../../../components/ProfileProvider/hook.ts",
  () => ({
    useProfile: jest.fn(),
  }),
);
jest.mock("../../../../../../../../../lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

const mount = async () => {
  const rendered = renderHook(() => useImportAction({ report }));
  await waitFor(() => expect(apiGet).toHaveBeenCalled());
  return rendered;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useProfile)
    .mockReturnValue({ profile: "familia", people } as never);
  jest.mocked(apiGet).mockResolvedValue({
    data: { imported: false, importedAt: null },
  } as never);
  jest.mocked(apiPost).mockResolvedValue({ data: { imported: 2 } } as never);
});

describe("useImportAction", () => {
  it("starts closed, with the rows the report would create", async () => {
    const { result } = await mount();

    expect(result.current.open).toBe(false);
    expect(result.current.summary).toBe("2 movimentações serão criadas.");
    expect(result.current.imported).toBe(false);
    expect(result.current.tooltip).toBeNull();
  });

  it("prefills the identifier and the owner when opened", async () => {
    const { result } = await mount();

    act(() => {
      result.current.openDialog();
    });

    expect(result.current).toMatchObject({
      open: true,
      identifier: "12345-6",
      ownerId: "p1",
      canSubmit: true,
    });
  });

  it("refuses to submit without an identifier", async () => {
    const { result } = await mount();
    act(() => {
      result.current.openDialog();
    });

    act(() => {
      result.current.setIdentifier("   ");
    });
    await act(async () => {
      await result.current.submit();
    });

    expect(apiPost).not.toHaveBeenCalled();
    expect(result.current.error).toBe(
      "Preencha o identificador e o responsável",
    );
  });

  it("posts the whole batch and closes on success", async () => {
    const { result } = await mount();
    act(() => {
      result.current.openDialog();
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(apiPost).toHaveBeenCalledWith("/api/ofx-imports", {
      fileHash: report.fileHash,
      fileName: report.fileName,
      ownerId: "p1",
      movements: expect.any(Array),
    });
    expect(result.current.open).toBe(false);
    expect(result.current.imported).toBe(true);
  });
});
