import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OfxScreen } from "@/app/leitor-ofx/_components/OfxScreen/index.tsx";
import { SESSION_KEY } from "@/app/leitor-ofx/_components/OfxScreen/session.helper.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet, apiUpload } from "@/lib/api.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiUpload: jest.fn(),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    // jsdom has no top layer; the import dialog only needs this not to throw.
  };
  HTMLDialogElement.prototype.close = function close() {
    // Same: nothing to tear down without a top layer.
  };
});

const report = {
  fileName: "extrato.ofx",
  fileHash: "a".repeat(64),
  org: "Banco",
  fid: null,
  currency: "BRL",
  accounts: [],
  months: [],
  totals: { incomeCents: 0, expenseCents: 0, balanceCents: 0, count: 0 },
};
const CORRECTS_PROJECTION =
  /totais do extrato viram movimentações e corrigem a projeção/i;
const LOCAL_ONLY = /sem subir nada/;

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  jest.mocked(useProfile).mockReturnValue({
    profile: "familia",
    people: [],
  } as never);
  jest.mocked(apiGet).mockResolvedValue({
    data: { imported: false, importedAt: null },
  } as never);
  jest.mocked(apiUpload).mockResolvedValue({ data: report } as never);
});

describe("OfxScreen", () => {
  it("opens on the upload card", async () => {
    render(<OfxScreen />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Leitor OFX" }),
    ).toBeInTheDocument();
    expect(screen.getByText(CORRECTS_PROJECTION)).toBeInTheDocument();
    expect(screen.queryByText(LOCAL_ONLY)).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Enviar extrato OFX" }),
      ).toBeInTheDocument(),
    );
  });

  it("shows the cached report instead, without flashing the upload card", async () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(report));

    render(<OfxScreen />);

    expect(
      screen.queryByRole("heading", { name: "Enviar extrato OFX" }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Relatório OFX" }),
      ).toBeInTheDocument(),
    );
  });

  it("swaps the upload card for the report it just read", async () => {
    const { container } = render(<OfxScreen />);
    await waitFor(() =>
      expect(container.querySelector("input[type=file]")).not.toBeNull(),
    );

    await userEvent.upload(
      container.querySelector("input[type=file]") as HTMLInputElement,
      new File(["<OFX>"], "extrato.ofx"),
    );

    expect(
      await screen.findByRole("heading", { name: "Relatório OFX" }),
    ).toBeInTheDocument();
  });
});
