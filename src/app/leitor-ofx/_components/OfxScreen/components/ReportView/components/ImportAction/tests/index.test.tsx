import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportAction } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/ImportAction/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet, apiPost } from "@/lib/api.ts";
import { people, report } from "./import-action-fixture.ts";

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
  jest
    .mocked(useProfile)
    .mockReturnValue({ profile: "familia", people } as never);
  jest.mocked(apiGet).mockResolvedValue({
    data: { imported: false, importedAt: null },
  } as never);
  jest.mocked(apiPost).mockResolvedValue({ data: { imported: 2 } } as never);
});

describe("ImportAction", () => {
  it("offers the import button, with no reason-why tooltip", () => {
    render(<ImportAction report={report} />);

    expect(screen.getByRole("button", { name: "Importar" })).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: "Por que não posso importar" }),
    ).not.toBeInTheDocument();
  });

  it("disables the button and explains why once the file is on record", async () => {
    jest.mocked(apiGet).mockResolvedValue({
      data: { imported: true, importedAt: null },
    } as never);

    render(<ImportAction report={report} />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Importar" })).toBeDisabled(),
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Este extrato já foi importado.",
    );
  });

  it("prefills the dialog and reports what it will create", async () => {
    render(<ImportAction report={report} />);

    await userEvent.click(screen.getByRole("button", { name: "Importar" }));

    expect(screen.getByLabelText("Identificador do documento")).toHaveValue(
      "12345-6",
    );
    expect(screen.getByLabelText("Responsável")).toHaveValue("p1");
    expect(
      screen.getByText("2 movimentações serão criadas."),
    ).toBeInTheDocument();
  });
});
