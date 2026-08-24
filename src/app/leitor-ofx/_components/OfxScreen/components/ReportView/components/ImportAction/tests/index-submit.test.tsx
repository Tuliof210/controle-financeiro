import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import type { OfxReport } from "@/app/api/ofx/types.ts";
import { ImportAction } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/ImportAction/index.tsx";
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

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: {
    open: boolean;
  }) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: { open: boolean }) {
    this.open = false;
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue({ push } as never);
  jest
    .mocked(useProfile)
    .mockReturnValue({ profile: "familia", people } as never);
  jest.mocked(apiGet).mockResolvedValue({
    data: { imported: false, importedAt: null },
  } as never);
});

const confirm = async () => {
  render(<ImportAction report={report} />);
  await userEvent.click(screen.getByRole("button", { name: "Importar" }));
  const [, submit] = screen.getAllByRole("button", { name: "Importar" });
  await userEvent.click(submit);
};

describe("ImportAction submit", () => {
  it("navigates home after a creating success", async () => {
    jest.mocked(apiPost).mockResolvedValue({ data: { imported: 2 } } as never);

    await confirm();

    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
  });

  it("stays on the report when the file was already imported", async () => {
    jest
      .mocked(apiPost)
      .mockResolvedValue({ error: "Já importado", code: "already_imported" });

    await confirm();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Importar" })).toBeDisabled(),
    );
    expect(push).not.toHaveBeenCalled();
  });
});
