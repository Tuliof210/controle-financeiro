import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportView } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";
import { report } from "./report-fixture.ts";

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

const props = {
  report: report(),
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
