import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { OfxReport } from "@/app/api/ofx/types.ts";
import { useImportAction } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/ImportAction/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet, apiPost } from "@/lib/api.ts";

// Only what useImportAction reads: the digest, the name, the accounts behind
// the identifier prefill, and the months the rows are built from.
const report = {
  fileName: "extrato.ofx",
  fileHash: "a".repeat(64),
  org: "Banco",
  accounts: [{ accountId: "12345-6" }],
  months: [{ month: 202_608, incomeCents: 1000, expenseCents: 400 }],
} as unknown as OfxReport;

const people = [{ id: "p1", name: "Ana", color: "violet" }];

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

const open = async () => {
  const rendered = renderHook(() => useImportAction({ report }));
  await waitFor(() => expect(apiGet).toHaveBeenCalled());
  act(() => {
    rendered.result.current.openDialog();
  });
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
});

describe("useImportAction refusals on submit", () => {
  it("keeps the dialog open and reports any other refusal", async () => {
    jest.mocked(apiPost).mockResolvedValue({ error: "Dados inválidos" });
    const { result } = await open();

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.open).toBe(true);
    expect(result.current.error).toBe("Dados inválidos");
    expect(result.current.imported).toBe(false);
  });

  it("reports a 2xx that carried no payload", async () => {
    jest.mocked(apiPost).mockResolvedValue({ data: undefined });
    const { result } = await open();

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.error).toBe("Erro inesperado");
  });

  it("closes on cancel", async () => {
    jest.mocked(apiPost).mockResolvedValue({ data: { imported: 1 } } as never);
    const { result } = await open();

    act(() => {
      result.current.close();
    });

    expect(result.current.open).toBe(false);
  });
});
