import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import type { OfxReport } from "@/app/api/ofx/types.ts";
import { useImportAction } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/ImportAction/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet, apiPost } from "@/lib/api.ts";

const report = {
  fileName: "extrato.ofx",
  fileHash: "a".repeat(64),
  org: "Banco",
  accounts: [{ accountId: "12345-6" }],
  months: [{ month: 202_608, incomeCents: 1000, expenseCents: 400 }],
} as unknown as OfxReport;

const people = [{ id: "p1", name: "Ana", color: "violet" }];
const push = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({
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
  jest.mocked(useRouter).mockReturnValue({ push } as never);
  jest
    .mocked(useProfile)
    .mockReturnValue({ profile: "familia", people } as never);
  jest.mocked(apiGet).mockResolvedValue({
    data: { imported: false, importedAt: null },
  } as never);
  jest.mocked(apiPost).mockResolvedValue({ data: { imported: 2 } } as never);
});

describe("useImportAction submit", () => {
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
    expect(push).not.toHaveBeenCalled();
    expect(result.current.error).toBe(
      "Preencha o identificador e o responsável",
    );
  });

  it("posts the batch and navigates home on success", async () => {
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
    expect(push).toHaveBeenCalledWith("/");
  });
});
