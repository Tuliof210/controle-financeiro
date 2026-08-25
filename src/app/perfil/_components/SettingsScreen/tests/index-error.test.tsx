import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsScreen } from "@/app/perfil/_components/SettingsScreen/index.tsx";
import { PREFS_COPY } from "@/app/perfil/_components/SettingsScreen/preferences-copy.ts";
import { apiGet } from "@/lib/api.ts";

jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(apiGet).mockResolvedValue({ error: "boom" } as never);
});

describe("SettingsScreen load failure", () => {
  it("does not paint default prefs as stored truth", async () => {
    render(<SettingsScreen />);

    expect(await screen.findByText(PREFS_COPY.loadError)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Teto de gastos" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: PREFS_COPY.retry }),
    ).toBeInTheDocument();
  });

  it("retries the GETs", async () => {
    render(<SettingsScreen />);
    await screen.findByText(PREFS_COPY.loadError);

    const calls = jest.mocked(apiGet).mock.calls.length;
    await userEvent.click(
      screen.getByRole("button", { name: PREFS_COPY.retry }),
    );

    await waitFor(() =>
      expect(jest.mocked(apiGet).mock.calls.length).toBeGreaterThan(calls),
    );
  });
});
