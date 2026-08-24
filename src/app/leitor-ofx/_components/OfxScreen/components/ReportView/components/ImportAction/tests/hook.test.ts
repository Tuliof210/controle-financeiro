import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
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
jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));

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
  jest.mocked(useRouter).mockReturnValue({ push: jest.fn() } as never);
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
});
