import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsScreen } from "@/app/perfil/_components/SettingsScreen/index.tsx";
import { PREFS_COPY } from "@/app/perfil/_components/SettingsScreen/preferences-copy.ts";
import { apiGet, apiPut } from "@/lib/api.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";
import { okDashboard } from "./preferences.fixture.ts";

jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(apiGet).mockImplementation((url: string) => {
    if (url.startsWith("/api/settings")) {
      return Promise.resolve({ data: DEFAULT_SETTINGS }) as never;
    }
    if (url.startsWith("/api/dashboard")) {
      return Promise.resolve({ data: okDashboard }) as never;
    }
    return Promise.resolve({ data: [] }) as never;
  });
  jest.mocked(apiPut).mockResolvedValue({ data: null });
});

describe("SettingsScreen", () => {
  it("titles the screen over its five sections", async () => {
    render(<SettingsScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Ajustes" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Teto de gastos" }),
      ).toBeInTheDocument(),
    );
    for (const title of [
      "Pessoas",
      "Objetivos",
      "Limite em objetivos",
      "Dados simulados",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });

  it("keeps the two mode toggles in separate radio groups", async () => {
    render(<SettingsScreen />);
    await waitFor(() =>
      expect(
        screen.getByRole("group", { name: "Como definir o teto" }),
      ).toBeInTheDocument(),
    );
    const ceiling = within(
      screen.getByRole("group", { name: "Como definir o teto" }),
    );
    const goals = within(
      screen.getByRole("group", { name: "Como definir o limite" }),
    );

    await userEvent.click(ceiling.getByRole("radio", { name: "Valor fixo" }));

    expect(ceiling.getByRole("radio", { name: "Valor fixo" })).toBeChecked();
    expect(goals.getByRole("radio", { name: "Porcentagem" })).toBeChecked();
  });

  it("saves a preference as soon as it changes", async () => {
    render(<SettingsScreen />);
    await waitFor(() =>
      expect(
        screen.getByLabelText("Contar previsões simuladas no dashboard"),
      ).toBeInTheDocument(),
    );

    await userEvent.click(
      screen.getByLabelText("Contar previsões simuladas no dashboard"),
    );

    await waitFor(() =>
      expect(apiPut).toHaveBeenCalledWith("/api/settings", {
        ...DEFAULT_SETTINGS,
        showSimulated: true,
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      PREFS_COPY.saved,
    );
  });
});
