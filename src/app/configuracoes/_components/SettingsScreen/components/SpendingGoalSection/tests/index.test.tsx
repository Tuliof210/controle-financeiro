import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpendingGoalSection } from "@/app/configuracoes/_components/SettingsScreen/components/SpendingGoalSection/index.tsx";
import { apiGet, apiPut } from "@/lib/api.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";

jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPut: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(apiGet)
    .mockResolvedValue({ data: { ...DEFAULT_SETTINGS, ceilingCents: 700 } });
  jest.mocked(apiPut).mockResolvedValue({ data: null });
});

describe("SpendingGoalSection", () => {
  it("shows the saved goal in its own card", async () => {
    render(<SpendingGoalSection />);

    expect(
      screen.getByRole("heading", { name: "Meta mensal" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText("Meta mensal")).toHaveValue("7,00"),
    );
  });

  it("confirms the save in a live region beside the button", async () => {
    render(<SpendingGoalSection />);
    await waitFor(() =>
      expect(screen.getByLabelText("Meta mensal")).toHaveValue("7,00"),
    );

    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Meta salva.");
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("shows a refused save", async () => {
    jest.mocked(apiPut).mockResolvedValue({ error: "Dados inválidos" });
    render(<SpendingGoalSection />);

    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText("Dados inválidos")).toBeInTheDocument();
  });
});
