import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useImportAction } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/ImportAction/hook.ts";
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

describe("useImportAction refusals", () => {
  it("disables the button when the server already has the file", async () => {
    jest.mocked(apiGet).mockResolvedValue({
      data: { imported: true, importedAt: "2026-08-12T00:00:00.000Z" },
    } as never);

    const { result } = renderHook(() => useImportAction({ report }));

    await waitFor(() => expect(result.current.imported).toBe(true));
    expect(result.current.tooltip).toContain("já foi importado em");
  });

  it("treats an already_imported answer as the end state, not an error", async () => {
    jest
      .mocked(apiPost)
      .mockResolvedValue({ error: "Já importado", code: "already_imported" });
    const { result } = await open();

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.open).toBe(false);
    expect(result.current.imported).toBe(true);
    expect(result.current.tooltip).toBe("Este extrato já foi importado.");
  });

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
