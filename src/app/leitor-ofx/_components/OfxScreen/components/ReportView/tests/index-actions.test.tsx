import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { OfxAccount, OfxMonth, OfxReport } from "@/app/api/ofx/types.ts";
import { ReportView } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    // jsdom has no top layer; the import dialog only needs this not to throw.
  };
  HTMLDialogElement.prototype.close = function close() {
    // Same: nothing to tear down without a top layer.
  };
});

const report: OfxReport = {
  fileName: "extrato.ofx",
  fileHash: "a".repeat(64),
  org: "Banco",
  fid: "0001",
  currency: "BRL",
  accounts: [{ bankId: "001", balanceCents: 50_000 } as OfxAccount],
  months: [202_608, 202_609].map((month) => ({ month }) as OfxMonth),
  totals: {
    incomeCents: 2000,
    expenseCents: 800,
    balanceCents: 1200,
    count: 2,
  },
};

const props = {
  report,
  error: null,
  loading: false,
  onClose: jest.fn(),
  onFile: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useProfile).mockReturnValue({
    profile: "familia",
    people: [],
  } as never);
  jest.mocked(apiGet).mockResolvedValue({
    data: { imported: false, importedAt: null },
  } as never);
});

describe("ReportView actions", () => {
  it("shows an error only when there is one", () => {
    const { rerender } = render(<ReportView {...props} />);

    expect(screen.queryByText("Erro inesperado")).not.toBeInTheDocument();

    rerender(<ReportView {...props} error="Erro inesperado" />);

    expect(screen.getByText("Erro inesperado")).toBeInTheDocument();
  });

  it("freezes close and swap while a parse is in flight", () => {
    render(<ReportView {...props} loading={true} />);

    expect(screen.getByRole("button", { name: "Fechar" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Trocar arquivo" }),
    ).toBeDisabled();
  });

  it("closes the report", async () => {
    const onClose = jest.fn();
    render(<ReportView {...props} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalled();
  });
});
