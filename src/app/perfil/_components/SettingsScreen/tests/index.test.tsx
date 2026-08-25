import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsScreen } from "@/app/perfil/_components/SettingsScreen/index.tsx";
import { apiGet, apiPut } from "@/lib/api.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";

jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

const SALVAR = { name: "Salvar" };

beforeAll(() => {
  // jsdom has no top layer, so the `open` attribute is driven by hand — without
  // it the dialog's content stays out of the accessibility tree.
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
  jest.mocked(apiGet).mockImplementation((url: string) => {
    if (url.startsWith("/api/settings")) {
      return Promise.resolve({ data: DEFAULT_SETTINGS }) as never;
    }
    return Promise.resolve({ data: [] }) as never;
  });
  jest.mocked(apiPut).mockResolvedValue({ data: null });
});

describe("SettingsScreen", () => {
  it("titles the screen over its five sections", async () => {
    render(<SettingsScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Perfil" }),
    ).toBeInTheDocument();
    for (const title of [
      "Pessoas",
      "Objetivos",
      "Teto de Gastos",
      "Limite em objetivos",
      "Dados simulados",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    await waitFor(() => expect(apiGet).toHaveBeenCalled());
  });

  it("keeps the two mode toggles in separate radio groups", async () => {
    render(<SettingsScreen />);
    await waitFor(() => expect(apiGet).toHaveBeenCalled());
    const ceiling = within(
      screen.getByRole("group", { name: "Como definir o teto" }),
    );
    const goals = within(
      screen.getByRole("group", { name: "Como definir o limite" }),
    );

    await userEvent.click(ceiling.getByRole("radio", { name: "Valor fixo" }));

    // A shared group name would have unchecked the other card's choice too.
    expect(ceiling.getByRole("radio", { name: "Valor fixo" })).toBeChecked();
    expect(goals.getByRole("radio", { name: "Porcentagem" })).toBeChecked();
  });

  it("saves the three cards at once and confirms it", async () => {
    render(<SettingsScreen />);
    await waitFor(() => expect(apiGet).toHaveBeenCalled());
    expect(screen.getByRole("button", SALVAR)).toBeDisabled();

    await userEvent.click(
      screen.getByLabelText("Contar previsões simuladas no dashboard"),
    );
    expect(screen.getByRole("button", SALVAR)).toBeEnabled();
    await userEvent.click(screen.getByRole("button", SALVAR));

    expect(apiPut).toHaveBeenCalledWith("/api/settings", {
      ...DEFAULT_SETTINGS,
      showSimulated: true,
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Ajustes salvos.",
    );
  });
});
