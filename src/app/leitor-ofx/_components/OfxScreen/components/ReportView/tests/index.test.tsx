import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
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

describe("ReportView", () => {
  it("heads the card with the file and what it read", () => {
    render(<ReportView {...props} />);

    expect(screen.getByText("extrato.ofx")).toBeInTheDocument();
    expect(screen.getByText("2 lançamentos lidos")).toBeInTheDocument();
  });

  it("spells the five facts out", () => {
    render(<ReportView {...props} />);

    expect(screen.getByText("Banco · 0001")).toBeInTheDocument();
    expect(screen.getByText("Ago/26 – Set/26")).toBeInTheDocument();
    expect(screen.getByText("BRL")).toBeInTheDocument();
    expect(screen.getByText("R$ 500,00")).toBeInTheDocument();
  });

  it("renders the monthly table under the facts", () => {
    render(<ReportView {...props} />);

    expect(
      screen.getByRole("table", { name: "Entradas e saídas por mês" }),
    ).toBeInTheDocument();
  });
});
