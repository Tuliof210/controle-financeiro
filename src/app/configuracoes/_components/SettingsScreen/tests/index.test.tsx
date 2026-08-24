import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { SettingsScreen } from "@/app/configuracoes/_components/SettingsScreen/index.tsx";
import { apiGet } from "@/lib/api.ts";

jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

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
  jest.mocked(apiGet).mockResolvedValue({ data: [] } as never);
});

describe("SettingsScreen", () => {
  it("titles the screen over its three sections", () => {
    render(<SettingsScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Configurações" }),
    ).toBeInTheDocument();
    for (const title of ["Pessoas", "Objetivos", "Meta mensal"]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });

  it("names the monthly goal in the subtitle, not just people and objetivos", () => {
    render(<SettingsScreen />);

    expect(
      screen.getByText("Pessoas, objetivos e a meta mensal da família."),
    ).toBeInTheDocument();
  });
});
